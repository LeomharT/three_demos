import { Card, Container, Image, SimpleGrid, Text, Title } from '@mantine/core';

export default function Examples() {
	return (
		<Container size='xl' pt='md'>
			<Title order={2}>Basic</Title>
			<Text c='dimmed'>Basic demo, learning how to create scene</Text>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} pt='md'>
				<Card withBorder component='a' href='/mix-color'>
					<Card.Section>
						<Image
							src='https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png'
							height={160}
							alt='Norway'
						/>
					</Card.Section>
					<Text mt='sm'>Shader Mix Color Test</Text>
					<Text c='dimmed'>Shader</Text>
				</Card>
				<Card withBorder component='a' href='/html-markers'>
					<Card.Section>
						<Image
							src='https://images.unsplash.com/photo-1579227114347-15d08fc37cae?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80'
							height={160}
							alt='Norway'
						/>
					</Card.Section>
					<Text mt='sm'>HTML Markers</Text>
					<Text c='dimmed'>CSS3DRenderer</Text>
				</Card>
				<Card withBorder component='a' href='/rendertarget'>
					<Card.Section>
						<Image
							src='https://images.unsplash.com/photo-1579227114347-15d08fc37cae?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80'
							height={160}
							alt='Norway'
						/>
					</Card.Section>
					<Text mt='sm'>WebGLRenderTarget</Text>
					<Text c='dimmed'>WebGLRenderTarget</Text>
				</Card>
			</SimpleGrid>
		</Container>
	);
}
