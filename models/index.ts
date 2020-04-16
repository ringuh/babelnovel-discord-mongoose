const config = require('../config.json');
import { Setting } from './setting.model'
import { connect } from 'mongoose';
connect('mongodb://localhost/babelnovel', {useNewUrlParser: true});


export { Setting, config };