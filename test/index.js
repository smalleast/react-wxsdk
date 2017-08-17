import 'components/styles/index.scss';
import './style';
import {ReduxBoot} from 'next-react-redux';
import App from './app';

ReduxBoot.run(App,'app');
