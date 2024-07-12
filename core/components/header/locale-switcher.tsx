'use client';

import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';

import { localeLanguageRegionMap, LocaleType } from '~/i18n';
import { useRouter } from '~/navigation';

import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem } from '../ui/select';

export const LocaleSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const selectedLocale = localeLanguageRegionMap[locale as LocaleType];

  const [regionSelected, setRegionSelected] = useState(selectedLocale.region);
  const [languageSelected, setLanguageSelected] = useState(selectedLocale.language);

  const groupedByRegion = useMemo(
    () =>
      Object.values(localeLanguageRegionMap).reduce<
        Record<string, { languages: string[]; flag: string }>
      >((acc, item) => {
        if (!acc[item.region]) {
          acc[item.region] = { languages: [item.language], flag: item.flag };

          return acc;
        }

        if (!acc[item.region]?.languages.includes(item.language)) {
          acc[item.region]?.languages.push(item.language);
        }

        return acc;
      }, {}),
    [],
  );

  const regions = Object.keys(groupedByRegion);

  const handleOnOpenChange = () => {
    setRegionSelected(selectedLocale.region);
    setLanguageSelected(selectedLocale.language);
  };

  const handleRegionChange = (region: string) => {
    setRegionSelected(region);

    if (!groupedByRegion[region]?.languages.includes(languageSelected)) {
      setLanguageSelected(groupedByRegion[region]?.languages[0]);
    }
  };

  const handleOnSubmit = () => {
    const newLocale: LocaleType = Object.keys(localeLanguageRegionMap).find(
      (key: LocaleType) =>
        localeLanguageRegionMap[key].language === languageSelected &&
        localeLanguageRegionMap[key].region === regionSelected,
    );

    router.replace('/', { locale: newLocale });
  };

  return (
    <Popover onOpenChange={handleOnOpenChange}>
      <PopoverTrigger asChild>
        <button className="flex h-12 items-center p-3 text-2xl">{selectedLocale.flag}</button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-6">
        <form className="flex flex-col gap-4" onSubmit={handleOnSubmit}>
          <p>Choose your country and language</p>
          <Select onValueChange={handleRegionChange} value={regionSelected}>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {groupedByRegion[region]?.flag} {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              setLanguageSelected(value);
            }}
            value={languageSelected}
          >
            <SelectContent>
              {groupedByRegion[regionSelected]?.languages.map((language) => (
                <SelectItem key={`${regionSelected}-${language}`} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="w-auto" type="submit">
            Go to site
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};
