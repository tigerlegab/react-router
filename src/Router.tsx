import { useEffect, useState } from "react";
import { BrowserRoute } from "./browserRouter";
import { useBrowserContent, useNavigationStatus } from "./hooks";
import { navigate, setErrorElement, setRoutes } from "./utils";

export interface RouterProps {
	routes: BrowserRoute[];
	page404: React.ReactNode;
	page500: (error: string) => React.ReactNode;
	pageLoader?: { element: React.ReactNode; firstLoadOnly?: boolean; };
}

export function Router({ routes, page404, page500, pageLoader }: RouterProps) {
	const [firstLoad, setFirstLoad] = useState(true);
	const status = useNavigationStatus();
	const content = useBrowserContent();

	useEffect(() => {
		setRoutes(routes);
		setErrorElement(page500);
		navigate("", {
			replace: true,
			search: true,
			state: true,
			callback: () => setFirstLoad(false)
		});
	}, []);

	if (status === "pending" && pageLoader && (!pageLoader.firstLoadOnly || (pageLoader.firstLoadOnly && firstLoad)))
		return pageLoader.element;

	if (!content) return page404;

	if (typeof content.element !== "function") return content.element;

	return <content.element params={content.params} data={content.data} />;
}