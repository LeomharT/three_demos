import { Card, Container, Image, SimpleGrid, Text, Title } from '@mantine/core';

const MANTINE_IMAGE_PATH =
	'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-';

const examples = [
	{
		title: 'Shader Mix Color Test',
		description: 'Shader',
		path: '/mix-color',
	},
	{
		title: 'HTML Markers',
		description: 'CSS3DRenderer Mixing',
		path: '/html-markers',
	},
	{
		title: 'WebGLRenderTarget',
		description: 'WebGLRenderTarget Demo',
		path: '/rendertarget',
	},
	{
		title: 'Mccree protal',
		description: 'Protal scene',
		path: '/mccree',
	},
	{
		title: 'Particle Stream',
		description: 'From Szenia Zadvornykh',
		path: '/particle-stream',
	},
	{
		title: 'YunGang Cave',
		description: 'Portal scene of yungang cave',
		path: '/yungang-cave',
	},
	{
		title: 'Digital Rain',
		description: 'Shader Practice of Matrix Rain',
		path: '/digital-rain',
	},
	{
		title: 'Spaceship',
		description: 'Spaceship',
		path: '/spaceship',
	},
	{
		title: 'SpaceStation',
		description: 'SpaceStation',
		path: '/spacestation',
	},
	{
		title: 'Contact Shadow',
		description: 'Contact Shadow',
		path: '/contact-shadow',
	},
];

const r3fExamples = [
	{
		title: 'Portal Through',
		description: 'Portal Through the scene',
		path: '/portal-through',
	},
	{
		title: 'CarShow',
		description: 'CarShow',
		path: '/carshow',
	},
];

const custom = [
	{
		title: 'CupBooks',
		description: 'CupBooks',
		path: '/custom/cupbooks',
	},
];

const threejsJourneyExapmles = [
	{
		title: '3D Text',
		description: '3D Text Mesh',
		path: '/tj-3dtext',
	},
	{
		title: 'Light Basic',
		description: 'Light basic',
		path: '/tj-light',
	},
	{
		title: 'Particle Demo',
		description: 'Particle Demo',
		path: '/tj-particle',
	},
	{
		title: 'Threejs Journey Level5',
		description: 'Threejs Journey Level5 Example',
		path: '/tj-level5',
	},
	{
		title: 'Threejs Journey Galaxy',
		description: 'Threejs Journey Galaxy Generator',
		path: '/tj-galaxy',
	},
	{
		title: 'Threejs Journey Textures',
		description: 'Threejs Journey Textures',
		path: '/tj-textures',
	},
	{
		title: 'Threejs Journey HauntedHouse',
		description: 'Threejs Journey HauntedHouse',
		path: '/tj-hauntedhouse',
	},
	{
		title: 'Threejs Journey Shadow',
		description: 'Threejs Journey Shadow',
		path: '/tj-shadow',
	},
	{
		title: 'Threejs Journey Scroll Animate',
		description: 'Threejs Journey Scroll Animate',
		path: '/tj-scrollanimate',
	},
	{
		title: 'Threejs Journey Physics',
		description: 'Threejs Journey Physics',
		path: '/tj-physics',
	},
	{
		title: 'Threejs Journey Environment',
		description: 'Threejs Journey Environment',
		path: '/tj-environment',
	},
	{
		title: 'Threejs Journey Realistic Render',
		description: 'Threejs Journey Realistic Render',
		path: '/tj-realistic',
	},
	{
		title: 'Threejs Journey Import Model',
		description: 'Threejs Journey Import Model',
		path: '/tj-import',
	},
	{
		title: 'Threejs Journey First Shader',
		description: 'Threejs Journey First Shader',
		path: '/tj-firstshader',
	},
	{
		title: 'Threejs Journey Shader Patterns',
		description: 'Threejs Journey Shader Patterns',
		path: '/tj-shaderpatterns',
	},
	{
		title: 'Threejs Journey RagingSea',
		description: 'Threejs Journey RagingSea',
		path: '/tj-ragingsea',
	},
	{
		title: 'Threejs Journey Galaxy Animation',
		description: 'Threejs Galaxy Animation',
		path: '/tj-galaxyanimation',
	},
	{
		title: 'Threejs Journey Modify Material',
		description: 'Threejs Modify Material',
		path: '/tj-modifymaterial',
	},
	{
		title: 'Threejs Journey Coffee Smoke',
		description: 'Threejs Coffee Smoke',
		path: '/tj-coffeesmoke',
	},
	{
		title: 'Threejs Journey Hologram',
		description: 'Threejs Journey Hologram',
		path: '/tj-hologram',
	},
	{
		title: 'Threejs Journey Fireworks',
		description: 'Threejs Journet Fireworks',
		path: '/tj-fireworks',
	},
];

function cover(index: number) {
	return ++index % 10 ? index % 10 : 1;
}

export default function Examples() {
	return (
		<Container size='xl' pt='md'>
			<Title order={2}>Basic</Title>
			<Text c='dimmed'>Basic demo, learning how to create scene</Text>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} pt='md' mb='xl'>
				{examples.map((value, index) => (
					<Card key={value.path} withBorder component='a' href={value.path}>
						<Card.Section>
							<Image
								height={160}
								alt='Norway'
								src={MANTINE_IMAGE_PATH + `${cover(index)}.png`}
							/>
						</Card.Section>
						<Text mt='sm'>{value.title}</Text>
						<Text c='dimmed'>{value.description}</Text>
					</Card>
				))}
			</SimpleGrid>
			<Title order={2}>r3f Exapmles</Title>
			<Text c='dimmed'>React three fiber official exapmle</Text>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} pt='md' mb='xl'>
				{r3fExamples.map((value, index) => (
					<Card key={value.path} withBorder component='a' href={value.path}>
						<Card.Section>
							<Image
								height={160}
								alt='Norway'
								src={MANTINE_IMAGE_PATH + `${cover(index)}.png`}
							/>
						</Card.Section>
						<Text mt='sm'>{value.title}</Text>
						<Text c='dimmed'>{value.description}</Text>
					</Card>
				))}
			</SimpleGrid>
			<Title order={2}>Custom Models</Title>
			<Text c='dimmed'>Blender Modules</Text>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} pt='md' mb='xl'>
				{custom.map((value, index) => (
					<Card key={value.path} withBorder component='a' href={value.path}>
						<Card.Section>
							<Image
								height={160}
								alt='Norway'
								src={MANTINE_IMAGE_PATH + `${cover(index)}.png`}
							/>
						</Card.Section>
						<Text mt='sm'>{value.title}</Text>
						<Text c='dimmed'>{value.description}</Text>
					</Card>
				))}
			</SimpleGrid>
			<Title order={2}>Threejs Journey Exapmles</Title>
			<Text c='dimmed'>Threejs Journey course examples</Text>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} pt='md' mb='xl'>
				{threejsJourneyExapmles.map((value, index) => (
					<Card key={value.path} withBorder component='a' href={value.path}>
						<Card.Section>
							<Image
								height={160}
								alt='Norway'
								src={MANTINE_IMAGE_PATH + `${cover(index)}.png`}
							/>
						</Card.Section>
						<Text mt='sm'>{value.title}</Text>
						<Text c='dimmed'>{value.description}</Text>
					</Card>
				))}
			</SimpleGrid>
		</Container>
	);
}
