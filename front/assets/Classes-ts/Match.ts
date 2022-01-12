// used to store an old match info to display on screen

import { LightUser, User } from "./User"

class Match {

    constructor(id: string, player0: LightUser, player1: LightUser, scorep0: number, scorep1: number, winner: LightUser) {
        this.id = id
        this.player0 = player0
        this.player1 = player1
        this.scorep0 = scorep0
        this.scorep1 = scorep1
        this.winner = winner
    }

    id: string
    player0: LightUser
    player1: LightUser
    scorep0: number
    scorep1: number
    winner: LightUser
}
export { Match }
