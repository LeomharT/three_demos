import { IconError404 } from '@tabler/icons-react';
import { lazy } from 'react';
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
} from 'react-router-dom';
import App from '../app';

const MixColor = lazy(() => import('../pages/MixColor'));
const PortalScene = lazy(() => import('../pages/PortalScene'));
const HTMLMarkers = lazy(() => import('../pages/HTMLMarkers'));

export const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path='/'>
			<Route index element={<App />} />
			<Route path='mix-color' element={<MixColor />} />
			<Route path='html-markers' element={<HTMLMarkers />} />
			<Route path='portal-scene' element={<PortalScene />} />
			<Route path='*' element={<IconError404 />} />
		</Route>
	)
);
