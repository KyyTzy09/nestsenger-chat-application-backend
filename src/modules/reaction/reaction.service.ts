import { Injectable } from '@nestjs/common';
import { ReactionRepository } from './reaction.repository';

@Injectable()
export class ReactionService {
    constructor(private readonly reactionRepository: ReactionRepository) { }


}
