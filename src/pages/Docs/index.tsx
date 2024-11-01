import { Box, Container, Group } from '@mantine/core';
import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import TableOfContent from '../../component/TableOfContents';

export default function Docs() {
	const location = useLocation();

	useLayoutEffect(() => {
		if (location.hash) {
			const root = document.querySelector(location.hash);
			if (root) root.scrollIntoView(true);
		}
	}, [location]);

	return (
		<Box>
			<Group align='start'>
				<Container size='xl'>
					<Outlet />
				</Container>
				<TableOfContent />
			</Group>
		</Box>
	);
}
