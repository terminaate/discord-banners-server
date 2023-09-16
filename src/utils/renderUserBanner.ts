import { User, UserModel } from '@/models/user.model';
import { UserActivity, UserActivityModel } from '@/models/user-activity.model';
import { Banner } from '@/banner/Banner';

export const renderUserBanner = async (
	user: UserModel | string,
	activity?: UserActivityModel,
) => {
	const userModel = typeof user === 'string' ? await User.findByPk(user) : user;

	if (userModel === null) {
		return null;
	}

	const userActivity =
		activity ??
		(await UserActivity.findOne({
			where: { userId: userModel.getDataValue('id') },
		}));

	return Banner.create(userModel, userActivity ?? undefined);
};
