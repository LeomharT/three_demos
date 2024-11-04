import {
	ActionIcon,
	AppShell,
	AppShellHeader,
	AppShellMain,
	AppShellNavbar,
	Button,
	Center,
	Container,
	Group,
	Image,
	Loader,
	NavLink,
	rem,
	Tabs,
	TabsList,
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
import { Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
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

	const navigate = useNavigate();

	const location = useLocation();

	const active = location.pathname.split('/').filter((val) => val)[0] ?? '/';

	return (
		<AppShell
			header={{
				height: 64,
			}}
			navbar={{
				width: '16.25rem',
				breakpoint: 'sm',
				collapsed: {
					desktop: active === 'docs' ? false : true,
					mobile: true,
				},
			}}
		>
			<AppShellHeader>
				<Container size='xl' h='100%'>
					<Group h='100%'>
						<Group>
							<Image h='32px' src='/favicon.ico' />
							<Title order={3}>Three Demos</Title>
						</Group>
						<Tabs
							ml='md'
							value={active}
							className={classes.tabs}
							onChange={(val) => val && navigate(val)}
						>
							<TabsList>
								<Tabs.Tab value='/'>Examples</Tabs.Tab>
								<Tabs.Tab value='docs'>Docs</Tabs.Tab>
							</TabsList>
						</Tabs>
						<Group gap='xs' ml='auto'>
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
			<AppShellNavbar>
				<NavLink active href='/docs' label='HTML Mixing With WegGL' />
			</AppShellNavbar>
			<AppShellMain className={classes.main}>
				<Suspense fallback={<Fallback />}>
					<Outlet />
				</Suspense>
			</AppShellMain>
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
		</AppShell>
	);
}

function Fallback() {
	return (
		<Center mt={'lg'}>
			<Loader />
		</Center>
	);
}
