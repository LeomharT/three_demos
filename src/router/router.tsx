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
const WebGLRenderTargetDemo = lazy(() => import('../pages/WebGLRenderTargetDemo'));
const MccreePortal = lazy(() => import('../pages/MccreePortal'));
const MccreePortalDocs = lazy(() => import('../pages/MccreePortal/docs.mdx'));
const PortalThrough = lazy(() => import('../pages/PortalThrough'));
const YunGangCave = lazy(() => import('../pages/YunGangCave'));
const LightBasic = lazy(() => import('../pages/LightBasic'));
const LightBasicDocs = lazy(() => import('../pages/LightBasic/docs.mdx'));
const _3DText = lazy(() => import('../pages/3DText'));
const _3DTextDocs = lazy(() => import('../pages/3DText/docs.mdx'));
const ParticleStream = lazy(() => import('../pages/Particle/ParticleStream'));
const Spaceship = lazy(() => import('../pages/Spaceship'));
const ParticleThreejsJourney = lazy(
	() => import('../pages/Particle/ParticleThreejsJourney')
);
const ParticleThreejsJourneyDocs = lazy(
	() => import('../pages/Particle/ParticleThreejsJourney/docs.mdx')
);
const ThreejsJourneyLevel5 = lazy(() => import('../pages/ThreejsJourneyLevel5'));
const GalaxyGenerator = lazy(() => import('../pages/Particle/GalaxyGenerator'));
const DigitalRain = lazy(() => import('../pages/DigitalRain'));
const TexturesBasic = lazy(() => import('../pages/Textures/TexturesBasic'));
const HauntedHouse = lazy(() => import('../pages/HauntedHouse'));
const HauntedHouseDocs = lazy(() => import('../pages/HauntedHouse/docs.mdx'));
const ThreejsJourneyShadow = lazy(() => import('../pages/Shadow/ThreejsJourneyShadow'));
const ScrollAnimate = lazy(() => import('../pages/ScrollAnimate'));
const ThreejsJourneyPhysics = lazy(
	() => import('../pages/Physics/ThreejsJourneyPhysics')
);

export const router = createBrowserRouter(
	createRoutesFromElements(
		<Route>
			<Route path='/' element={<App />}>
				<Route index element={<Examples />} />
				<Route path='docs' element={<Docs />}>
					<Route index element={<Navigate to='html-marker' />} />
					<Route path='html-marker' element={<HTMLMarkersDocs />} />
					<Route path='rendertarget' element={<WebGLRenderTargetDemoDcos />} />
					<Route path='mccree' element={<MccreePortalDocs />} />
					<Route path='light-basic' element={<LightBasicDocs />} />
					<Route path='3D-text' element={<_3DTextDocs />} />
					<Route path='tj-particle' element={<ParticleThreejsJourneyDocs />} />
					<Route path='tj-hauntedhouse' element={<HauntedHouseDocs />} />
				</Route>
			</Route>
			<Route path='mix-color' element={<MixColor />} />
			<Route path='html-markers' element={<HTMLMarkers />} />
			<Route path='rendertarget' element={<WebGLRenderTargetDemo />} />
			<Route path='mccree' element={<MccreePortal />} />
			<Route path='portal-scene' element={<PortalScene />} />
			<Route path='portal-through' element={<PortalThrough />} />
			<Route path='yungang-cave' element={<YunGangCave />} />
			<Route path='digital-rain' element={<DigitalRain />} />
			<Route path='particle-stream' element={<ParticleStream />} />
			<Route path='spaceship' element={<Spaceship />} />
			<Route path='tj-3dtext' element={<_3DText />} />
			<Route path='tj-light' element={<LightBasic />} />
			<Route path='tj-particle' element={<ParticleThreejsJourney />} />
			<Route path='tj-level5' element={<ThreejsJourneyLevel5 />} />
			<Route path='tj-galaxy' element={<GalaxyGenerator />} />
			<Route path='tj-textures' element={<TexturesBasic />} />
			<Route path='tj-hauntedhouse' element={<HauntedHouse />} />
			<Route path='tj-shadow' element={<ThreejsJourneyShadow />} />
			<Route path='tj-scrollanimate' element={<ScrollAnimate />} />
			<Route path='tj-physics' element={<ThreejsJourneyPhysics />} />
			<Route path='*' element={<IconError404 />} />
		</Route>
	),
	{
		future: {
			v7_relativeSplatPath: true,
			v7_partialHydration: true,
			v7_fetcherPersist: true,
			v7_normalizeFormMethod: true,
			v7_skipActionErrorRevalidation: true,
		},
	}
);
