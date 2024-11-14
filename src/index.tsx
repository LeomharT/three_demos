import { MantineProvider } from '@mantine/core';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './router/router';

const root = ReactDOM.createRoot(
	document.querySelector('#root') as HTMLDivElement
);

root.render(
	<MantineProvider withGlobalClasses withCssVariables>
		<RouterProvider router={router} future={{ v7_startTransition: true }} />
	</MantineProvider>
);
