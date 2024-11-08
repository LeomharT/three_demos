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
];

function cover(index: number) {
	return ++index % 10 ? index % 10 : 1;
}

export default function Examples() {
	return (
		<Container size='xl' pt='md'>
			<Title order={2}>Basic</Title>
			<Text c='dimmed'>Basic demo, learning how to create scene</Text>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} pt='md'>
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
		</Container>
	);
}
