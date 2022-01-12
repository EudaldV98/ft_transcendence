import { forwardRef, Inject } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { timeout } from "rxjs"
import { BroadcastOperator, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { GameService } from "src/service/game.service"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Repository } from "typeorm"
import { Ball } from "./ball.entity"
import { Paddle } from "./paddle.entity"
import { User } from "./user.entity"

export class Game {
	constructor(gameService: GameService, winning_score: number, ball_amount: number) {
		this.gameService = gameService
		this.ball_amount = ball_amount
		this.winning_score = winning_score
	}

	id: string

	status: string = "idle" // idle, paused, started, forfeitp0, forfeitp1
	type: string
	gameService: GameService
	winning_score: number
	loopId: any = null
	player0socket: Socket | null = null
	player1socket: Socket | null = null
	// spectators: Array<Socket>
	balls: Array<Ball>
	ball_amount: number
	room: BroadcastOperator<DefaultEventsMap>
	tickSpeed = 1000 / 32

	player0: User
	player1: User

	paddle0: Paddle
	paddle1: Paddle

	scorep0: number = 0

	scorep1: number = 0

	async create_new_ball(time: number) {
		await new Promise(f => setTimeout(f, time));
		let new_ball = new Ball()
							// for x: 48 tickspeed -> 4 is a great speed (48 -> 1.5 for y) 
		console.log((1000 / this.tickSpeed) / 12)
		new_ball.speed.x = 12 / ((1000 / this.tickSpeed) / 12) * (Math.random() > .5 ? 1 : -1);
		new_ball.speed.y = ((1000 / this.tickSpeed) / 32) * (Math.random() * 2 - 1);
		// new_ball.speed.len = 8;
		console.log('BallSpeed: ' + new_ball.speed.x + " " + new_ball.speed.y)
		this.balls.push(new_ball)
	}

	async create_paddles(){
		this.paddle0 = new Paddle(30, 300)
		this.room.emit('paddle0Info', { paddle0_info: [this.paddle0.topLeftx, this.paddle0.topLefty, this.paddle0.size.x, this.paddle0.size.y]})
		this.paddle1 = new Paddle(810, 300)
		this.room.emit('paddle1Info', { paddle1_info:[this.paddle1.topLeftx, this.paddle1.topLefty, this.paddle1.size.x, this.paddle1.size.y]})
	}

	tick() {
		let ballsinfo = []
		for (let i = 0; i < this.balls.length; ++i) {
				var score = this.balls[i].tick();
				if (score == 0) {
						this.scorep1++
						ballsinfo.push({ id: i, status: "erased", ball_location: [this.balls[i].topLeftx, this.balls[i].topLefty] })
						this.balls.splice(i, 1)
						this.create_new_ball(1000)
						if (this.scorep1 == this.winning_score) {
								this.gameService.endgame(this)
								return
						}
				}
				else if (score == 1) {
						this.scorep0++
						ballsinfo.push({ id: i, status: "erased", ball_location: [this.balls[i].topLeftx, this.balls[i].topLefty] })
						this.balls.splice(i, 1)
						this.create_new_ball(1000)
						if (this.scorep0 == this.winning_score) {
								this.gameService.endgame(this)
								return
						}
				}
				else {
					this.balls[i].checkPaddleLeft(this.paddle0)
					this.balls[i].checkPaddleRight(this.paddle1)
					ballsinfo.push({ id: i, status: "normal", ball_info: [this.balls[i].topLeftx, this.balls[i].topLefty, this.balls[i].size.x, this.balls[i].size.y] })
				}
		}
		//emit game info & balls info
		this.room.emit('gameInfo', ballsinfo)
		//emit paddle locations
		if (this.paddle0.motion)
			this.room.emit('paddle0Info', { paddle0_info: [this.paddle0.topLeftx, this.paddle0.topLefty, this.paddle0.size.x, this.paddle0.size.y]})
		if (this.paddle1.motion)
			this.room.emit('paddle1Info', { paddle1_info:[this.paddle1.topLeftx, this.paddle1.topLefty, this.paddle1.size.x, this.paddle1.size.y]})
	}

	matchinfo() {
		this.room.emit('matchInfo', { id: this.id, player0: this.player0.toLightuser(), player1: this.player1.toLightuser() }) 
	}

	async start() {
		this.player0socket['game'] = this.id // useful for when the client temporarily disconnect midgame (pause the game)
		this.player1socket['game'] = this.id //
		this.status = "setup"
		this.room.emit('matchFound', { id: this.id})
		// this.players[1].emit('matchFound', { id: this.id})
		await new Promise(f => setTimeout(f, 250)); // awaiting client switching page client side, rly ?
		this.matchinfo()

		this.balls = new Array
		for (let i = 0; i < this.ball_amount; ++i)
			this.create_new_ball(i * 1000)
		
		// paddles
		this.create_paddles()

		// for (let i: number = 3; i >= 0; --i) {
		// 	this.room.emit('matchSetup', { gameStart: i} ) 
		// 	await new Promise(f => setTimeout(f, 1000)); // countdown
		// }

		if (this.player0socket == null || this.player1socket == null) { // prepause the game if one of the player is dc
			this.status = 'started'
			this.pause()
		}
		else if (this.status == 'setup' && this.loopId == null) { // condtion probably not needed
			this.status = 'started'
			this.loopId = setInterval(this.tick.bind(this), this.tickSpeed)
		}
	}

	pause() { // client is the client that disconnected
		if (this.status == 'started') { //pause only if the game has started
			this.status = "paused"
			clearInterval(this.loopId)
			this.loopId = null
		}
	}

	unpause() {
		if (this.status == 'paused' && this.loopId == null) {
			this.status = 'started'
			this.loopId = setInterval(this.tick.bind(this), this.tickSpeed)
		}
	}

	stop() {
		clearInterval(this.loopId)
		this.loopId = null
	}
}