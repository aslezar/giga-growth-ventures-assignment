const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const User = require('../models/user');

const signinController = async (req, res) => {
	if (req.body.googleAccessToken) {
		// gogole-auth
		const { googleAccessToken } = req.body;

		axios
			.get('https://www.googleapis.com/oauth2/v3/userinfo', {
				headers: {
					Authorization: `Bearer ${googleAccessToken}`,
				},
			})
			.then(async (response) => {
				const firstName = response.data.given_name;
				const lastName = response.data.family_name;
				const email = response.data.email;
				const picture = response.data.picture;

				const existingUser = await User.findOne({ email });

				if (!existingUser)
					return res.status(404).json({ message: "User don't exist!" });

				const token = jwt.sign(
					{
						email: existingUser.email,
						id: existingUser._id,
					},
					process.env.JWT_SECRET,
					{
						expiresIn: process.env.JWT_LIFETIME,
					}
				);

				res.status(200).json({ result: existingUser, token });
			})
			.catch((err) => {
				res.status(400).json({ message: 'Invalid access token!' });
			});
	} else {
		res.status(400).json({ message: 'Please provide Acess Token!' });
	}
};

const signupController = async (req, res) => {
	if (req.body.googleAccessToken) {
		const { googleAccessToken } = req.body;

		axios
			.get('https://www.googleapis.com/oauth2/v3/userinfo', {
				headers: {
					Authorization: `Bearer ${googleAccessToken}`,
				},
			})
			.then(async (response) => {
				const firstName = response.data.given_name;
				const lastName = response.data.family_name;
				const email = response.data.email;
				const picture = response.data.picture;

				const existingUser = await User.findOne({ email });

				if (existingUser)
					return res.status(400).json({ message: 'User already exist!' });

				const result = await User.create({
					verified: 'true',
					email,
					firstName,
					lastName,
					profilePicture: picture,
				});

				const token = jwt.sign(
					{
						email: result.email,
						id: result._id,
					},
					process.env.JWT_SECRET,
					{
						expiresIn: process.env.JWT_LIFETIME,
					}
				);

				res.status(200).json({ result, token });
			})
			.catch((err) => {
				res.status(400).json({ message: 'Invalid access token!' });
			});
	} else {
		res.status(400).json({ message: 'Please provide Acess Token!!' });
	}
};

module.exports = {
	signinController,
	signupController,
};
