import { VisuallyHidden, VisuallyHiddenProps } from '@mantine/core';

type HiddentProps = VisuallyHiddenProps;

export default function Hiddent(props: HiddentProps) {
	if (props.hidden) return <VisuallyHidden {...props} />;
	return props.children;
}
