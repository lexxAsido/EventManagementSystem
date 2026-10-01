exports.getProfile = (req, res) => {
  const { _id, name, email, isVerified, createdAt } = req.user;
  res.status(200).json({
    success: true,
    user: { id: _id, name, email, isVerified, createdAt },
  });
};