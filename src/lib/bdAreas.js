// bdAreas — a structured Bangladesh address (ON-F10): the 64 districts, each with its main thanas / upazilas (city
// areas for Dhaka and Chattogram), and the courier zone each area falls in. Pathao, RedX and Steadfast book a parcel by
// city · zone · area; the zone also decides the delivery charge (deliveryRates.js):
//   'dhaka'    Inside Dhaka   the Dhaka city thanas
//   'sub'      Sub-Dhaka      the rest of Dhaka district (Savar, Keraniganj …), Gazipur and Narayanganj
//   'outside'  Outside Dhaka  every other district
// Used by components/AreaPicker.jsx on Create order, the order link page and the storefront checkout. The free
// "house, road" line stays next to it.
//
//   DISTRICTS                 [{ name, division }] in A–Z order
//   areasOf(district)         the district's areas, A–Z
//   zoneOf(district, area)    'dhaka' | 'sub' | 'outside' ('' when the district is unknown)
//   guessArea(text)           { district, area } found in a free-text address (for older addresses), or null
//   lineOf(text, { area, district })      the house / road part of an older free-text address
//   addressText({ line, area, district })   "House 14, Road 7, Uttara, Dhaka"

const D = (name, division, zone, areas) => ({ name, division, zone, areas: areas.split(',').map((x) => x.trim()).filter(Boolean) });

// Dhaka district: the city thanas are Inside Dhaka, the upazilas around the city are Sub-Dhaka
const DHAKA_CITY = 'Adabor,Badda,Banani,Bangshal,Bashundhara,Cantonment,Chawkbazar,Dakshinkhan,Demra,Dhanmondi,Farmgate,Gendaria,Gulshan,Hazaribagh,Jatrabari,Kafrul,Kalabagan,Kamrangirchar,Khilgaon,Khilkhet,Kotwali,Lalbagh,Malibagh,Mirpur,Mohakhali,Mohammadpur,Motijheel,Mugda,New Market,Pallabi,Paltan,Ramna,Rampura,Sabujbagh,Shah Ali,Shahbagh,Sher-e-Bangla Nagar,Shyampur,Sutrapur,Tejgaon,Turag,Uttara,Uttarkhan,Vatara,Wari';
const DHAKA_SUB = 'Ashulia,Dhamrai,Dohar,Keraniganj,Nawabganj,Savar';

const LIST = [
  // Dhaka division
  D('Dhaka', 'Dhaka', 'dhaka', DHAKA_CITY + ',' + DHAKA_SUB),
  D('Gazipur', 'Dhaka', 'sub', 'Board Bazar,Gazipur Sadar,Kaliakair,Kaliganj,Kapasia,Sreepur,Tongi'),
  D('Narayanganj', 'Dhaka', 'sub', 'Araihazar,Bandar,Fatullah,Narayanganj Sadar,Rupganj,Siddhirganj,Sonargaon'),
  D('Narsingdi', 'Dhaka', 'outside', 'Belabo,Monohardi,Narsingdi Sadar,Palash,Raipura,Shibpur'),
  D('Manikganj', 'Dhaka', 'outside', 'Daulatpur,Ghior,Harirampur,Manikganj Sadar,Saturia,Shibalaya,Singair'),
  D('Munshiganj', 'Dhaka', 'outside', 'Gazaria,Lohajang,Munshiganj Sadar,Sirajdikhan,Sreenagar,Tongibari'),
  D('Tangail', 'Dhaka', 'outside', 'Basail,Ghatail,Gopalpur,Kalihati,Madhupur,Mirzapur,Sakhipur,Tangail Sadar'),
  D('Kishoreganj', 'Dhaka', 'outside', 'Bajitpur,Bhairab,Katiadi,Kishoreganj Sadar,Kuliarchar,Pakundia'),
  D('Faridpur', 'Dhaka', 'outside', 'Alfadanga,Bhanga,Boalmari,Faridpur Sadar,Madhukhali,Nagarkanda'),
  D('Gopalganj', 'Dhaka', 'outside', 'Gopalganj Sadar,Kashiani,Kotalipara,Muksudpur,Tungipara'),
  D('Madaripur', 'Dhaka', 'outside', 'Kalkini,Madaripur Sadar,Rajoir,Shibchar'),
  D('Rajbari', 'Dhaka', 'outside', 'Baliakandi,Goalanda,Kalukhali,Pangsha,Rajbari Sadar'),
  D('Shariatpur', 'Dhaka', 'outside', 'Bhedarganj,Damudya,Gosairhat,Naria,Shariatpur Sadar,Zajira'),
  // Chattogram division
  D('Chattogram', 'Chattogram', 'outside', 'Agrabad,Anwara,Bakalia,Banshkhali,Bayazid,Boalkhali,Chandanaish,Chawkbazar,Double Mooring,Fatikchhari,Halishahar,Hathazari,Khulshi,Kotwali,Lohagara,Mirsharai,Pahartali,Panchlaish,Patenga,Patiya,Rangunia,Raozan,Sandwip,Satkania,Sitakunda'),
  D("Cox's Bazar", 'Chattogram', 'outside', "Chakaria,Cox's Bazar Sadar,Kutubdia,Maheshkhali,Pekua,Ramu,Teknaf,Ukhia"),
  D('Cumilla', 'Chattogram', 'outside', 'Barura,Burichang,Chandina,Chauddagram,Cumilla Sadar,Cumilla Sadar Dakshin,Daudkandi,Debidwar,Homna,Laksam,Muradnagar'),
  D('Feni', 'Chattogram', 'outside', 'Chhagalnaiya,Daganbhuiyan,Feni Sadar,Fulgazi,Parshuram,Sonagazi'),
  D('Noakhali', 'Chattogram', 'outside', 'Begumganj,Chatkhil,Companiganj,Hatiya,Kabirhat,Noakhali Sadar,Senbagh,Subarnachar'),
  D('Lakshmipur', 'Chattogram', 'outside', 'Kamalnagar,Lakshmipur Sadar,Raipur,Ramganj,Ramgati'),
  D('Chandpur', 'Chattogram', 'outside', 'Chandpur Sadar,Faridganj,Haimchar,Hajiganj,Kachua,Matlab Dakshin,Matlab Uttar,Shahrasti'),
  D('Brahmanbaria', 'Chattogram', 'outside', 'Akhaura,Ashuganj,Bancharampur,Brahmanbaria Sadar,Kasba,Nabinagar,Nasirnagar,Sarail'),
  D('Rangamati', 'Chattogram', 'outside', 'Baghaichhari,Barkal,Kaptai,Kawkhali,Langadu,Rangamati Sadar'),
  D('Khagrachhari', 'Chattogram', 'outside', 'Dighinala,Khagrachhari Sadar,Mahalchhari,Matiranga,Panchhari,Ramgarh'),
  D('Bandarban', 'Chattogram', 'outside', 'Alikadam,Bandarban Sadar,Lama,Naikhongchhari,Rowangchhari,Ruma,Thanchi'),
  // Rajshahi division
  D('Rajshahi', 'Rajshahi', 'outside', 'Bagha,Bagmara,Boalia,Charghat,Durgapur,Godagari,Mohanpur,Motihar,Paba,Puthia,Rajpara,Shah Makhdum,Tanore'),
  D('Bogura', 'Rajshahi', 'outside', 'Adamdighi,Bogura Sadar,Dhunat,Dhupchanchia,Gabtali,Kahaloo,Nandigram,Sariakandi,Shajahanpur,Sherpur,Shibganj,Sonatala'),
  D('Pabna', 'Rajshahi', 'outside', 'Atgharia,Bera,Bhangura,Chatmohar,Faridpur,Ishwardi,Pabna Sadar,Santhia,Sujanagar'),
  D('Sirajganj', 'Rajshahi', 'outside', 'Belkuchi,Chauhali,Kamarkhanda,Kazipur,Raiganj,Shahjadpur,Sirajganj Sadar,Tarash,Ullapara'),
  D('Natore', 'Rajshahi', 'outside', 'Bagatipara,Baraigram,Gurudaspur,Lalpur,Naldanga,Natore Sadar,Singra'),
  D('Naogaon', 'Rajshahi', 'outside', 'Atrai,Badalgachhi,Dhamoirhat,Manda,Mohadevpur,Naogaon Sadar,Niamatpur,Patnitala,Porsha,Raninagar,Sapahar'),
  D('Chapainawabganj', 'Rajshahi', 'outside', 'Bholahat,Chapainawabganj Sadar,Gomastapur,Nachole,Shibganj'),
  D('Joypurhat', 'Rajshahi', 'outside', 'Akkelpur,Joypurhat Sadar,Kalai,Khetlal,Panchbibi'),
  // Khulna division
  D('Khulna', 'Khulna', 'outside', 'Batiaghata,Dacope,Daulatpur,Dighalia,Dumuria,Khalishpur,Khan Jahan Ali,Khulna Sadar,Koyra,Paikgachha,Phultala,Rupsha,Sonadanga,Terokhada'),
  D('Jashore', 'Khulna', 'outside', 'Abhaynagar,Bagherpara,Chaugachha,Jashore Sadar,Jhikargachha,Keshabpur,Manirampur,Sharsha'),
  D('Satkhira', 'Khulna', 'outside', 'Assasuni,Debhata,Kalaroa,Kaliganj,Satkhira Sadar,Shyamnagar,Tala'),
  D('Bagerhat', 'Khulna', 'outside', 'Bagerhat Sadar,Chitalmari,Fakirhat,Kachua,Mollahat,Mongla,Morrelganj,Rampal,Sarankhola'),
  D('Kushtia', 'Khulna', 'outside', 'Bheramara,Daulatpur,Khoksa,Kumarkhali,Kushtia Sadar,Mirpur'),
  D('Jhenaidah', 'Khulna', 'outside', 'Harinakunda,Jhenaidah Sadar,Kaliganj,Kotchandpur,Maheshpur,Shailkupa'),
  D('Magura', 'Khulna', 'outside', 'Magura Sadar,Mohammadpur,Shalikha,Sreepur'),
  D('Narail', 'Khulna', 'outside', 'Kalia,Lohagara,Narail Sadar'),
  D('Chuadanga', 'Khulna', 'outside', 'Alamdanga,Chuadanga Sadar,Damurhuda,Jibannagar'),
  D('Meherpur', 'Khulna', 'outside', 'Gangni,Meherpur Sadar,Mujibnagar'),
  // Barishal division
  D('Barishal', 'Barishal', 'outside', 'Agailjhara,Babuganj,Bakerganj,Banaripara,Barishal Sadar,Gaurnadi,Hizla,Mehendiganj,Muladi,Wazirpur'),
  D('Bhola', 'Barishal', 'outside', 'Bhola Sadar,Borhanuddin,Char Fasson,Daulatkhan,Lalmohan,Manpura,Tazumuddin'),
  D('Patuakhali', 'Barishal', 'outside', 'Bauphal,Dashmina,Dumki,Galachipa,Kalapara,Mirzaganj,Patuakhali Sadar,Rangabali'),
  D('Pirojpur', 'Barishal', 'outside', 'Bhandaria,Indurkani,Kawkhali,Mathbaria,Nazirpur,Nesarabad,Pirojpur Sadar'),
  D('Barguna', 'Barishal', 'outside', 'Amtali,Bamna,Barguna Sadar,Betagi,Patharghata,Taltali'),
  D('Jhalokathi', 'Barishal', 'outside', 'Jhalokathi Sadar,Kathalia,Nalchity,Rajapur'),
  // Sylhet division
  D('Sylhet', 'Sylhet', 'outside', 'Amberkhana,Balaganj,Beanibazar,Bishwanath,Companiganj,Dakshin Surma,Fenchuganj,Golapganj,Gowainghat,Jaintiapur,Kanaighat,Osmani Nagar,Sylhet Sadar,Zakiganj,Zindabazar'),
  D('Moulvibazar', 'Sylhet', 'outside', 'Barlekha,Juri,Kamalganj,Kulaura,Moulvibazar Sadar,Rajnagar,Sreemangal'),
  D('Habiganj', 'Sylhet', 'outside', 'Ajmiriganj,Bahubal,Baniachong,Chunarughat,Habiganj Sadar,Lakhai,Madhabpur,Nabiganj,Shayestaganj'),
  D('Sunamganj', 'Sylhet', 'outside', 'Bishwambharpur,Chhatak,Derai,Dharampasha,Doarabazar,Jagannathpur,Jamalganj,Shantiganj,Sullah,Sunamganj Sadar,Tahirpur'),
  // Rangpur division
  D('Rangpur', 'Rangpur', 'outside', 'Badarganj,Gangachara,Kaunia,Mithapukur,Pirgachha,Pirganj,Rangpur Sadar,Taraganj'),
  D('Dinajpur', 'Rangpur', 'outside', 'Biral,Birampur,Birganj,Bochaganj,Chirirbandar,Dinajpur Sadar,Fulbari,Ghoraghat,Hakimpur,Kaharole,Khansama,Nawabganj,Parbatipur'),
  D('Kurigram', 'Rangpur', 'outside', 'Bhurungamari,Char Rajibpur,Chilmari,Kurigram Sadar,Nageshwari,Phulbari,Rajarhat,Raumari,Ulipur'),
  D('Gaibandha', 'Rangpur', 'outside', 'Gaibandha Sadar,Gobindaganj,Palashbari,Phulchhari,Sadullapur,Saghata,Sundarganj'),
  D('Nilphamari', 'Rangpur', 'outside', 'Dimla,Domar,Jaldhaka,Kishoreganj,Nilphamari Sadar,Saidpur'),
  D('Lalmonirhat', 'Rangpur', 'outside', 'Aditmari,Hatibandha,Kaliganj,Lalmonirhat Sadar,Patgram'),
  D('Thakurgaon', 'Rangpur', 'outside', 'Baliadangi,Haripur,Pirganj,Ranisankail,Thakurgaon Sadar'),
  D('Panchagarh', 'Rangpur', 'outside', 'Atwari,Boda,Debiganj,Panchagarh Sadar,Tetulia'),
  // Mymensingh division
  D('Mymensingh', 'Mymensingh', 'outside', 'Bhaluka,Dhobaura,Fulbaria,Gafargaon,Gauripur,Haluaghat,Ishwarganj,Muktagachha,Mymensingh Sadar,Nandail,Phulpur,Tarakanda,Trishal'),
  D('Jamalpur', 'Mymensingh', 'outside', 'Bakshiganj,Dewanganj,Islampur,Jamalpur Sadar,Madarganj,Melandaha,Sarishabari'),
  D('Netrokona', 'Mymensingh', 'outside', 'Atpara,Barhatta,Durgapur,Kalmakanda,Kendua,Khaliajuri,Madan,Mohanganj,Netrokona Sadar,Purbadhala'),
  D('Sherpur', 'Mymensingh', 'outside', 'Jhenaigati,Nakla,Nalitabari,Sherpur Sadar,Sreebardi'),
];

const SUB_IN_DHAKA = new Set(DHAKA_SUB.split(','));
const BY_NAME = Object.fromEntries(LIST.map((d) => [d.name, d]));

/** The 64 districts, A–Z: [{ name, division }]. */
export const DISTRICTS = LIST.map((d) => ({ name: d.name, division: d.division })).sort((a, b) => a.name.localeCompare(b.name));
export const DIVISIONS = [...new Set(LIST.map((d) => d.division))];
/** The district's areas (thanas / upazilas), A–Z. */
export const areasOf = (district) => ((BY_NAME[district] || {}).areas || []).slice().sort((a, b) => a.localeCompare(b));
/** The courier zone of an area: 'dhaka' | 'sub' | 'outside' ('' for an unknown district). */
export function zoneOf(district, area) {
  const d = BY_NAME[district];
  if (!d) return '';
  if (d.name === 'Dhaka') return SUB_IN_DHAKA.has(area) ? 'sub' : 'dhaka';
  return d.zone;
}
export const ZONE_LABEL = { dhaka: 'Inside Dhaka', sub: 'Sub-Dhaka', outside: 'Outside Dhaka' };

/** An area and district found in a free-text address ("House 9, Road 2, Mohammadpur, Dhaka 1207"), or null.
 *  The longest area name that appears wins; the district named in the text breaks a tie between same-name areas. */
export function guessArea(text) {
  const t = ' ' + String(text || '').toLowerCase().replace(/[^a-z' -]+/g, ' ') + ' ';
  if (!t.trim()) return null;
  const hasWord = (w) => t.includes(' ' + w.toLowerCase() + ' ');
  let best = null;
  LIST.forEach((d) => d.areas.forEach((a) => {
    if (!hasWord(a)) return;
    const score = a.length + (hasWord(d.name) ? 100 : 0);
    if (!best || score > best.score) best = { district: d.name, area: a, score };
  }));
  if (best) return { district: best.district, area: best.area };
  const d = LIST.find((x) => hasWord(x.name) || (x.name === 'Chattogram' && hasWord('chittagong')) || (x.name === 'Cumilla' && hasWord('comilla')) || (x.name === 'Bogura' && hasWord('bogra')) || (x.name === 'Jashore' && hasWord('jessore')) || (x.name === 'Barishal' && hasWord('barisal')));
  return d ? { district: d.name, area: '' } : null;
}

/** The "house, road" part of a free-text address once its area and district are picked: the comma parts that only
 *  name the area or the district (a postcode may follow) are dropped. "House 14, Road 7, Uttara, Dhaka 1230" → "House 14, Road 7". */
export function lineOf(text, { area = '', district = '' } = {}) {
  const names = [area, district].filter(Boolean).map((x) => x.toLowerCase());
  const parts = String(text || '').split(',').map((x) => x.trim()).filter(Boolean);
  const kept = parts.filter((x) => !names.includes(x.toLowerCase().replace(/[-\s]*\d{4}$/, '').trim()));
  return kept.length ? kept.join(', ') : String(text || '').trim();
}

/** One line for the courier: "House 14, Road 7, Uttara, Dhaka". The area and district are added when the line
 *  doesn't already name them. */
export function addressText({ line = '', area = '', district = '' } = {}) {
  const base = String(line || '').trim().replace(/[,\s]+$/, '');
  const low = base.toLowerCase();
  const more = [area, district].filter((x) => x && !low.includes(String(x).toLowerCase()));
  return [base, ...more].filter(Boolean).join(', ');
}
