import { CodeHighlight, CodeHighlightProps } from '@mantine/code-highlight';
import { Card } from '@mantine/core';

type MDXCodeProps = CodeHighlightProps;

export default function MDXCode(props: MDXCodeProps) {
	return (
		<Card p={0} withBorder>
			<CodeHighlight {...props} />
		</Card>
	);
}
