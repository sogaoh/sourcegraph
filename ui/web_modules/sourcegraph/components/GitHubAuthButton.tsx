import * as React from "react";
import {AuthButton} from "sourcegraph/components/AuthButton";
import {Location} from "sourcegraph/Location";

interface Props {
	scopes?: string;
	returnTo?: string | Location;

	color?: string;
	outline?: boolean;
	block?: boolean;
	size?: string;
	className?: string;
	tabIndex?: number;
	pageName?: string;
	img?: boolean;
	style?: React.CSSProperties;
	children?: React.ReactNode[];
}

export function GitHubAuthButton(props: Props): JSX.Element {
	const scopes = props.scopes || "read:org,user:email";

	return (
		<AuthButton
			provider="github"
			iconType="github"
			eventLabel="InitiateGitHubOAuth2Flow"
			scopes={scopes}
			returnTo={props.returnTo}
			color={props.color}
			outline={props.outline}
			block={props.block}
			size={props.size}
			className={props.className}
			tabIndex={props.tabIndex}
			pageName={props.pageName}
			img={props.img}
			style={props.style}>
			{props.children}
		</AuthButton>
	);
}
