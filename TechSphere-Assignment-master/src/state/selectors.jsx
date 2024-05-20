import { selector } from 'recoil';
import axios from 'axios';

export const fetchSongs = selector({
    key: 'fetchSongs',
    get: async () => {
        const response = await axios.get(`https://saavn.dev/api/songs/yDeAS8Eh/suggestions`);
        return response.data;
    },
});
