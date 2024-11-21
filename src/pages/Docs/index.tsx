import { Box, Container } from '@mantine/core';
import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import classes from './style.module.css';

export default function Docs() {
	const location = useLocation();

	useLayoutEffect(() => {
		if (location.hash) {
			const root = document.querySelector(location.hash);
			if (root) root.scrollIntoView({ behavior: 'smooth' });
		}
	}, [location]);

	return (
		<Box className={classes.root}>
			<Container w='100%' size='sm'>
				<Outlet />
			</Container>
		</Box>
	);
}
