import {
	ActionIcon,
	AppShell,
	AppShellHeader,
	AppShellMain,
	Button,
	Card,
	Container,
	Group,
	Image,
	rem,
	SimpleGrid,
	Text,
	Title,
	useMantineColorScheme,
} from '@mantine/core';
import { Spotlight, spotlight, SpotlightActionData } from '@mantine/spotlight';
import {
	IconBrandGithub,
	IconMoon,
	IconSearch,
	IconSun,
} from '@tabler/icons-react';
import classes from './app.module.css';

const actions: SpotlightActionData[] = [
	{
		id: 'home',
		label: 'Home',
		description: 'Get to home page',
		onClick: () => console.log('Home'),
	},
	{
		id: 'dashboard',
		label: 'Dashboard',
		description: 'Get full information about current system status',
		onClick: () => console.log('Dashboard'),
	},
	{
		id: 'documentation',
		label: 'Documentation',
		description: 'Visit documentation to lean more about all features',
		onClick: () => console.log('Documentation'),
	},
];

export default function App() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();

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
						<Group gap='xs'>
							<Button
								unstyled
								className={classes.search}
								onClick={spotlight.toggle}
							>
								<Group>
									<IconSearch />
									<Text size='sm'>Search</Text>
									<Text size='xs'>Ctrl+K</Text>
								</Group>
							</Button>
							<ActionIcon variant='default' radius='md' size='lg'>
								<IconBrandGithub />
							</ActionIcon>
							<ActionIcon
								size='lg'
								radius='md'
								variant='default'
								onClick={toggleColorScheme}
							>
								{colorScheme === 'light' ? <IconMoon /> : <IconSun />}
							</ActionIcon>
						</Group>
					</Group>
				</Container>
			</AppShellHeader>
			<AppShellMain className={classes.main}>
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
					</SimpleGrid>
				</Container>
				<Spotlight
					actions={actions}
					nothingFound='Nothing found...'
					highlightQuery
					searchProps={{
						leftSection: (
							<IconSearch
								stroke={1.5}
								style={{ width: rem(20), height: rem(20) }}
							/>
						),
						placeholder: 'Search...',
					}}
				/>
			</AppShellMain>
		</AppShell>
	);
}
