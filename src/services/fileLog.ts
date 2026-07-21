import RNFS from 'react-native-fs';

export const fileLog = async (msg: string) => {
  const line = `${new Date().toISOString()} | ${msg}\n`;
  await RNFS.appendFile(`${RNFS.ExternalDirectoryPath}/bg.log`, line, 'utf8');
};
