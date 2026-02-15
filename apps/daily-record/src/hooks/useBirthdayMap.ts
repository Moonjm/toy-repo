import { useMemo } from 'react';
import dayjs from 'dayjs';
import type { User } from '../api/users';
import type { PairResponse } from '../api/pair';

export function useBirthdayMap(
  user: User | null,
  pairInfo: PairResponse | null,
  isPaired: boolean,
  months: dayjs.Dayjs[]
) {
  return useMemo(() => {
    const myGenderEmoji = user?.gender === 'MALE' ? '👨' : user?.gender === 'FEMALE' ? '👩' : null;
    const partnerGenderEmoji =
      pairInfo?.partnerGender === 'MALE'
        ? '👨'
        : pairInfo?.partnerGender === 'FEMALE'
          ? '👩'
          : null;

    const map: Record<string, { emoji: string; label: string }[]> = {};
    const addBirthday = (
      birthDate: string | null | undefined,
      genderEmoji: string | null,
      label: string
    ) => {
      if (!birthDate) return;
      const md = birthDate.substring(5); // MM-DD
      const emoji = genderEmoji ? `🎂${genderEmoji}` : '🎂';
      months.forEach((m) => {
        const key = `${m.year()}-${md}`;
        if (dayjs(key, 'YYYY-MM-DD').isValid() && dayjs(key).month() === m.month()) {
          if (!map[key]) map[key] = [];
          map[key].push({ emoji, label });
        }
      });
    };
    addBirthday(user?.birthDate, myGenderEmoji, '내 생일');
    if (isPaired) {
      addBirthday(
        pairInfo?.partnerBirthDate,
        partnerGenderEmoji,
        `${pairInfo?.partnerName ?? '상대방'} 생일`
      );
    }
    return map;
  }, [user?.birthDate, user?.gender, pairInfo, isPaired, months]);
}
