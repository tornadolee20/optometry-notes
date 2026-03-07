import { Language } from './translations';

export interface RegionOption {
  value: string;
  label: string;
  group?: string;
}

// First level: Country/Region selection for zh-TW
export const getCountryOptions = (language: Language): RegionOption[] => {
  if (language === 'zh-TW') {
    return [
      { value: 'tw', label: '台灣' },
      { value: 'cn', label: '中國大陸' },
      { value: 'hk', label: '香港' },
      { value: 'mo', label: '澳門' },
      { value: 'sg', label: '新加坡' },
      { value: 'my', label: '馬來西亞' },
      { value: 'other', label: '其他/海外' },
    ];
  }
  return [];
};

// Taiwan cities/counties
export const getTaiwanCityOptions = (): RegionOption[] => {
  return [
    // 北部
    { value: 'tw_taipei', label: '台北市', group: '北部' },
    { value: 'tw_newtaipei', label: '新北市', group: '北部' },
    { value: 'tw_keelung', label: '基隆市', group: '北部' },
    { value: 'tw_taoyuan', label: '桃園市', group: '北部' },
    { value: 'tw_hsinchu_city', label: '新竹市', group: '北部' },
    { value: 'tw_hsinchu_county', label: '新竹縣', group: '北部' },
    { value: 'tw_yilan', label: '宜蘭縣', group: '北部' },
    // 中部
    { value: 'tw_miaoli', label: '苗栗縣', group: '中部' },
    { value: 'tw_taichung', label: '台中市', group: '中部' },
    { value: 'tw_changhua', label: '彰化縣', group: '中部' },
    { value: 'tw_nantou', label: '南投縣', group: '中部' },
    { value: 'tw_yunlin', label: '雲林縣', group: '中部' },
    // 南部
    { value: 'tw_chiayi_city', label: '嘉義市', group: '南部' },
    { value: 'tw_chiayi_county', label: '嘉義縣', group: '南部' },
    { value: 'tw_tainan', label: '台南市', group: '南部' },
    { value: 'tw_kaohsiung', label: '高雄市', group: '南部' },
    { value: 'tw_pingtung', label: '屏東縣', group: '南部' },
    // 東部
    { value: 'tw_hualien', label: '花蓮縣', group: '東部' },
    { value: 'tw_taitung', label: '台東縣', group: '東部' },
    // 離島
    { value: 'tw_penghu', label: '澎湖縣', group: '離島' },
    { value: 'tw_kinmen', label: '金門縣', group: '離島' },
    { value: 'tw_lienchiang', label: '連江縣', group: '離島' },
  ];
};

export const getRegionOptions = (language: Language): RegionOption[] => {
  if (language === 'zh-TW') {
    return [
      { value: 'tw_north', label: '台灣 - 北部' },
      { value: 'tw_central', label: '台灣 - 中部' },
      { value: 'tw_south', label: '台灣 - 南部' },
      { value: 'tw_east', label: '台灣 - 東部' },
      { value: 'tw_island', label: '台灣 - 離島' },
      { value: 'cn', label: '中國大陸' },
      { value: 'hk', label: '香港' },
      { value: 'mo', label: '澳門' },
      { value: 'sg', label: '新加坡' },
      { value: 'my', label: '馬來西亞' },
      { value: 'other', label: '其他/海外' },
    ];
  }

  if (language === 'zh-CN') {
    return [
      // 直轄市
      { value: 'cn_beijing', label: '北京市', group: '直辖市' },
      { value: 'cn_tianjin', label: '天津市', group: '直辖市' },
      { value: 'cn_shanghai', label: '上海市', group: '直辖市' },
      { value: 'cn_chongqing', label: '重庆市', group: '直辖市' },
      // 省份
      { value: 'cn_hebei', label: '河北省', group: '省份' },
      { value: 'cn_shanxi', label: '山西省', group: '省份' },
      { value: 'cn_liaoning', label: '辽宁省', group: '省份' },
      { value: 'cn_jilin', label: '吉林省', group: '省份' },
      { value: 'cn_heilongjiang', label: '黑龙江省', group: '省份' },
      { value: 'cn_jiangsu', label: '江苏省', group: '省份' },
      { value: 'cn_zhejiang', label: '浙江省', group: '省份' },
      { value: 'cn_anhui', label: '安徽省', group: '省份' },
      { value: 'cn_fujian', label: '福建省', group: '省份' },
      { value: 'cn_jiangxi', label: '江西省', group: '省份' },
      { value: 'cn_shandong', label: '山东省', group: '省份' },
      { value: 'cn_henan', label: '河南省', group: '省份' },
      { value: 'cn_hubei', label: '湖北省', group: '省份' },
      { value: 'cn_hunan', label: '湖南省', group: '省份' },
      { value: 'cn_guangdong', label: '广东省', group: '省份' },
      { value: 'cn_hainan', label: '海南省', group: '省份' },
      { value: 'cn_sichuan', label: '四川省', group: '省份' },
      { value: 'cn_guizhou', label: '贵州省', group: '省份' },
      { value: 'cn_yunnan', label: '云南省', group: '省份' },
      { value: 'cn_shaanxi', label: '陕西省', group: '省份' },
      { value: 'cn_gansu', label: '甘肃省', group: '省份' },
      { value: 'cn_qinghai', label: '青海省', group: '省份' },
      // 自治區
      { value: 'cn_guangxi', label: '广西壮族自治区', group: '自治区' },
      { value: 'cn_neimenggu', label: '内蒙古自治区', group: '自治区' },
      { value: 'cn_ningxia', label: '宁夏回族自治区', group: '自治区' },
      { value: 'cn_xizang', label: '西藏自治区', group: '自治区' },
      { value: 'cn_xinjiang', label: '新疆维吾尔自治区', group: '自治区' },
      // 特別行政區
      { value: 'hk', label: '香港特别行政区', group: '特别行政区' },
      { value: 'mo', label: '澳门特别行政区', group: '特别行政区' },
      { value: 'tw', label: '台湾地区', group: '其他' },
      { value: 'other', label: '其他/海外', group: '其他' },
    ];
  }

  // Default English options (not used in current system but prepared for future)
  return [
    { value: 'tw', label: 'Taiwan', group: 'Asia-Pacific' },
    { value: 'cn', label: 'Mainland China', group: 'Asia-Pacific' },
    { value: 'hk', label: 'Hong Kong', group: 'Asia-Pacific' },
    { value: 'mo', label: 'Macau', group: 'Asia-Pacific' },
    { value: 'sg', label: 'Singapore', group: 'Asia-Pacific' },
    { value: 'my', label: 'Malaysia', group: 'Asia-Pacific' },
    { value: 'th', label: 'Thailand', group: 'Asia-Pacific' },
    { value: 'vn', label: 'Vietnam', group: 'Asia-Pacific' },
    { value: 'ph', label: 'Philippines', group: 'Asia-Pacific' },
    { value: 'id', label: 'Indonesia', group: 'Asia-Pacific' },
    { value: 'au', label: 'Australia', group: 'Asia-Pacific' },
    { value: 'nz', label: 'New Zealand', group: 'Asia-Pacific' },
    { value: 'jp', label: 'Japan', group: 'Asia-Pacific' },
    { value: 'kr', label: 'South Korea', group: 'Asia-Pacific' },
    { value: 'in', label: 'India', group: 'Asia-Pacific' },
    { value: 'us', label: 'United States', group: 'Americas' },
    { value: 'ca', label: 'Canada', group: 'Americas' },
    { value: 'uk', label: 'United Kingdom', group: 'Europe' },
    { value: 'de', label: 'Germany', group: 'Europe' },
    { value: 'fr', label: 'France', group: 'Europe' },
    { value: 'other', label: 'Other / International', group: 'Other' },
  ];
};

export const getProfessionalTypeOptions = (language: Language) => {
  if (language === 'zh-CN') {
    return [
      { value: 'ophthalmologist', label: '眼科医生' },
      { value: 'optometrist', label: '视光从业人员' },
      { value: 'optical_technician', label: '眼镜店技术人员' },
      { value: 'other', label: '其他' },
    ];
  }
  
  // zh-TW doesn't need this as they use license number
  return [
    { value: 'optometrist', label: '驗光師' },
    { value: 'optician', label: '驗光生' },
    { value: 'other', label: '其他' },
  ];
};

// Professional role options for country-based registration
export const getProfessionalRoleOptions = (language: Language, country?: string) => {
  if (country === 'TW' || language === 'zh-TW') {
    return [
      { value: 'optometrist', label: '驗光人員' },
      { value: 'ophthalmologist', label: '眼科醫師' },
    ];
  }
  
  if (country === 'CN' || language === 'zh-CN') {
    return [
      { value: 'optometrist', label: '眼镜验光师' },
      { value: 'ophthalmologist', label: '眼科医生' },
    ];
  }
  
  // English / other countries
  return [
    { value: 'optometrist', label: 'Optometrist' },
    { value: 'ophthalmologist', label: 'Ophthalmologist' },
  ];
};

// Country options for registration
export const getRegistrationCountryOptions = (language: Language): RegionOption[] => {
  if (language === 'zh-TW') {
    return [
      { value: 'TW', label: '台灣' },
      { value: 'CN', label: '中國大陸' },
      { value: 'HK', label: '香港' },
      { value: 'SG', label: '新加坡' },
      { value: 'MY', label: '馬來西亞' },
      { value: 'OTHER', label: '其他國家' },
    ];
  }
  
  if (language === 'zh-CN') {
    return [
      { value: 'CN', label: '中国大陆' },
      { value: 'TW', label: '台湾' },
      { value: 'HK', label: '香港' },
      { value: 'SG', label: '新加坡' },
      { value: 'MY', label: '马来西亚' },
      { value: 'OTHER', label: '其他国家' },
    ];
  }
  
  // English
  return [
    { value: 'TW', label: 'Taiwan' },
    { value: 'CN', label: 'China' },
    { value: 'HK', label: 'Hong Kong' },
    { value: 'SG', label: 'Singapore' },
    { value: 'MY', label: 'Malaysia' },
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'OTHER', label: 'Other' },
  ];
};

export const getYearsOfExperienceOptions = (language: Language) => {
  if (language === 'zh-CN') {
    return [
      { value: 'less_than_1', label: '1年以下' },
      { value: '1_to_3', label: '1-3年' },
      { value: '3_to_5', label: '3-5年' },
      { value: '5_to_10', label: '5-10年' },
      { value: 'more_than_10', label: '10年以上' },
    ];
  }
  
  return [
    { value: 'less_than_1', label: '1年以下' },
    { value: '1_to_3', label: '1-3年' },
    { value: '3_to_5', label: '3-5年' },
    { value: '5_to_10', label: '5-10年' },
    { value: 'more_than_10', label: '10年以上' },
  ];
};
