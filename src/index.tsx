import { MantineProvider } from '@mantine/core';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ShaderChunk } from 'three';
import simplex2DNoise from './include/simplex2DNoise.glsl?raw';
import './index.css';
import { router } from './router/router';

// @ts-ignore
ShaderChunk['simplex2DNoise'] = simplex2DNoise;

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLDivElement);

root.render(
	<MantineProvider withGlobalClasses withCssVariables>
		<RouterProvider router={router} future={{ v7_startTransition: true }} />
	</MantineProvider>
);
