import { IconError404 } from '@tabler/icons-react';
import { lazy } from 'react';
import {
	createBrowserRouter,
	createRoutesFromElements,
	Navigate,
	Route,
} from 'react-router-dom';
import App from '../app';

const MixColor = lazy(() => import('../pages/MixColor'));
const PortalScene = lazy(() => import('../pages/PortalScene'));
const HTMLMarkers = lazy(() => import('../pages/HTMLMarkers'));
const HTMLMarkersDocs = lazy(() => import('../pages/HTMLMarkers/docs.mdx'));
const Examples = lazy(() => import('../pages/Examples'));
const Docs = lazy(() => import('../pages/Docs'));
const WebGLRenderTargetDemoDcos = lazy(
	() => import('../pages/WebGLRenderTargetDemo/docs.mdx')
);
const WebGLRenderTargetDemo = lazy(
	() => import('../pages/WebGLRenderTargetDemo')
);
const MccreePortal = lazy(() => import('../pages/MccreePortal'));

export const router = createBrowserRouter(
	createRoutesFromElements(
		<Route>
			<Route path='/' element={<App />}>
				<Route index element={<Examples />} />
				<Route path='docs' element={<Docs />}>
					<Route index element={<Navigate to='html-marker' />} />
					<Route path='html-marker' element={<HTMLMarkersDocs />} />
					<Route path='rendertarget' element={<WebGLRenderTargetDemoDcos />} />
				</Route>
			</Route>
			<Route path='mix-color' element={<MixColor />} />
			<Route path='html-markers' element={<HTMLMarkers />} />
			<Route path='rendertarget' element={<WebGLRenderTargetDemo />} />
			<Route path='mccree' element={<MccreePortal />} />
			<Route path='portal-scene' element={<PortalScene />} />
			<Route path='*' element={<IconError404 />} />
		</Route>
	)
);
