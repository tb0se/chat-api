export const generateToken = () => {
	const hasher = new Bun.CryptoHasher('sha256');
	const arr = new Uint8Array(32);

	hasher.update(arr);
	return hasher.digest('hex');
};
