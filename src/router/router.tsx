import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
} from 'react-router-dom';
import App from '../app';
import { IconError404 } from '@tabler/icons-react';
import SmoothstepTest from '../pages/SmoothstepTest';

export const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path='/'>
			<Route index element={<App />} />
			<Route path='smoothstep-test' element={<SmoothstepTest />} />
			<Route path='*' element={<IconError404 />} />
		</Route>
	)
);
