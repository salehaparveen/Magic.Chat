import { useContext, useMemo } from 'react';

import { ServerContext } from '../ServerContext';

export const useStream = (
	streamName: string,
	options?: {
		retransmit?: boolean | undefined;
		retransmitToSelf?: boolean | undefined;
	},
): (<T>(eventName: string, callback: (data: T) => void) => () => void) => {
	const { getStream } = useContext(ServerContext);
	return useMemo(() => getStream(streamName, options), [getStream, streamName, options]);
};
