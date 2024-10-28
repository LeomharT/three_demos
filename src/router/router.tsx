import { IconError404 } from '@tabler/icons-react';
import { lazy } from 'react';
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
} from 'react-router-dom';
import App from '../app';

const MixColor = lazy(() => import('../pages/MixColor'));

export const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path='/'>
			<Route index element={<App />} />
			<Route path='mix-color' element={<MixColor />} />
			<Route path='*' element={<IconError404 />} />
		</Route>
	)
);
