import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, Res, HttpCode, UseInterceptors, UploadedFile } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express'
import { fstat } from 'fs';
import multer, { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path/posix';
import { ImageUpload } from 'src/middleware/image.upload.middleware';
import { ProfileService } from 'src/service/profile.service';


@Controller('api/profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService
  ) {}

  @Get('me')
  me(@Req() request: Request) {
    return this.profileService.me(request)
  }

  @Get('me/nickname')
  get_nickname(@Req() request: Request) {
    return this.profileService.get_nickname(request);
  }

  @Post('me/nickname')
  set_nickname(@Req() request : Request, @Query('nickname') nick) {
    return this.profileService.set_nickname(request, nick);
  }

  @Post('me/picture')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: '../data/image_tmp',
      filename: new ImageUpload().editFileName
    }),
    fileFilter: new ImageUpload().imageFileFilter
  }))
  async uploadedFile(@UploadedFile() file: Express.Multer.File, @Req() request: Request) {
    const sharp = require('sharp')
    const fs = require('fs')

    sharp.cache(false)
    await sharp(file.path)
      .resize({width: 750, height: 750})
      .png()
      .toFile('../data/users/' + request.cookies['user_id'] + '.png')
    fs.unlinkSync(file.path)
    return true
  }

  @Get('me/picture')
  seeUploadedFile(@Req() req: Request, @Res() res) {
    return res.sendFile(req.cookies['user_id'] + '.png', { root: '../data/users' });
  }
}