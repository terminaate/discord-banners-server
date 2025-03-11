import { UserDTO } from '@/dto/user.dto';

// @note: format - {date}-{memberId}:{username}:{overwrites?}
export const getCacheKey = async (
	userId: string,
	username: string,
	overwrites?: Partial<Record<keyof UserDTO, string>>,
) => {
	let cacheKey = `${userId}@${username}`;

	if (Object.values(overwrites ?? {}).some(Boolean)) {
		cacheKey += `@${JSON.stringify(overwrites)}`;
	}

	return `${Date.now()}-${cacheKey}`;
};
