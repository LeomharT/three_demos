import {
	ActionIcon,
	Anchor,
	Box,
	CopyButton,
	Title,
	TitleProps,
} from '@mantine/core';
import { IconCheck, IconLink } from '@tabler/icons-react';
import classes from './style.module.css';

type MDXTitleProps = TitleProps & {
	href?: string;
};

export default function MDXTitle({ id, href = '#', ...props }: MDXTitleProps) {
	return (
		<Title {...props} classNames={{ ...classes }}>
			<Box id={id}></Box>
			<CopyButton value={href}>
				{({ copied, copy }) => {
					return (
						<ActionIcon variant='transparent' size='lg' onClick={copy}>
							{copied ? <IconCheck /> : <IconLink />}
						</ActionIcon>
					);
				}}
			</CopyButton>
			<Anchor href={href} unstyled>
				{props.children}
			</Anchor>
		</Title>
	);
}
