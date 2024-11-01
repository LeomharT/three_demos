import { ActionIcon, Anchor, Box, Title, TitleProps } from '@mantine/core';
import { IconLink } from '@tabler/icons-react';
import classes from './style.module.css';
type MDXTitleProps = TitleProps & {
	href?: string;
};

export default function MDXTitle({ id, href, ...props }: MDXTitleProps) {
	return (
		<Title {...props} classNames={{ ...classes }}>
			<Box id={id}></Box>
			<ActionIcon variant='transparent' size='lg' c='dimmed'>
				<IconLink />
			</ActionIcon>
			<Anchor href={href} unstyled>
				{props.children}
			</Anchor>
		</Title>
	);
}
