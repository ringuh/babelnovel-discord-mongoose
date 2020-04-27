const config: ConfigInterface = require('../config.json');
import { Setting } from './setting.model'
import { connect } from 'mongoose';
import { Novel } from './novel.model';
import { Chapter } from './chapter.model';
import { ConfigInterface } from './interfaces/config.interface';
import { CommandRestriction } from './commandRestriction.model';
connect('mongodb://localhost/babelnovel', { useNewUrlParser: true, useUnifiedTopology: true });


export { Setting, Novel, Chapter, CommandRestriction, config };