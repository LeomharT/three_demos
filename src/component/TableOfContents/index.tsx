import { Box, Group, Text } from '@mantine/core';
import { IconList } from '@tabler/icons-react';

export default function TableOfContent() {
	return (
		<Box>
			<Group wrap='nowrap'>
				<IconList />
				<Text>Table of contents</Text>
			</Group>
		</Box>
	);
}
