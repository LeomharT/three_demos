import {
	ActionIcon,
	AppShell,
	AppShellHeader,
	AppShellMain,
	Card,
	Container,
	Group,
	Image,
	Kbd,
	SimpleGrid,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { IconBrandGithub, IconSearch } from '@tabler/icons-react';

export default function App() {
	return (
		<AppShell
			header={{
				height: 64,
			}}
		>
			<AppShellHeader>
				<Container size='xl' h='100%'>
					<Group h='100%' justify='space-between'>
						<Group>
							<Image h='32px' src='/favicon.ico' />
							<Title order={3}>Three Demos</Title>
						</Group>
						<Group>
							<TextInput
								placeholder='search'
								leftSection={<IconSearch />}
								rightSection={<Kbd mr='lg'>CtrlK</Kbd>}
							/>
							<ActionIcon variant='default' radius='md' size='lg'>
								<IconBrandGithub />
							</ActionIcon>
						</Group>
					</Group>
				</Container>
			</AppShellHeader>
			<AppShellMain>
				<Container size='xl' pt='md'>
					<Title order={2}>Basic</Title>
					<Text c='dimmed'>Basic demo, learning how to create scene</Text>
					<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} pt='md'>
						<Card withBorder component='a' href='/smoothstep-test'>
							<Card.Section>
								<Image
									src='https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png'
									height={160}
									alt='Norway'
								/>
							</Card.Section>
							<Text mt='sm'>Shader Smoothstep Test</Text>
							<Text c='dimmed'>Shader</Text>
						</Card>
					</SimpleGrid>
				</Container>
			</AppShellMain>
		</AppShell>
	);
}
