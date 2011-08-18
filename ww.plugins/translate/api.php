<?php

/**
	* language list for Translate plugin
	*
	* @return array valid languages
	*/
function Translate_languagesGet() {
	$languages=array(
		''=>' -- choose -- ',
		'en'=>'English',
		'da'=>'Danish',
		'fr'=>'French',
		'de'=>'German',
		'ga'=>'Irish',
		'es'=>'Spanish'
	);
	// from https://code.google.com/apis/language/translate/v1/getting_started.html
	$languages=json_decode(
		'{" -- choose -- ":"","AFRIKAANS":"af","ALBANIAN":"sq","AMHARIC":"am",'
		.'"ARABIC":"ar","ARMENIAN":"hy","AZERBAIJANI":"az","BASQUE":"eu",'
		.'"BELARUSIAN":"be","BENGALI":"bn","BIHARI":"bh","BRETON":"br",'
		.'"BULGARIAN":"bg","BURMESE":"my","CATALAN":"ca","CHEROKEE":"chr",'
		.'"CHINESE":"zh","CHINESE_SIMPLIFIED":"zh-CN","CHINESE_TRADITIONAL":"zh-TW",'
		.'"CORSICAN":"co","CROATIAN":"hr","CZECH":"cs","DANISH":"da","DHIVEHI":"dv",'
		.'"DUTCH":"nl",	"ENGLISH":"en","ESPERANTO":"eo","ESTONIAN":"et",'
		.'"FAROESE":"fo","FILIPINO":"tl","FINNISH":"fi","FRENCH":"fr","FRISIAN":"fy",'
		.'"GALICIAN":"gl","GEORGIAN":"ka","GERMAN":"de","GREEK":"el","GUJARATI":"gu",'
		.'"HAITIAN_CREOLE":"ht","HEBREW":"iw","HINDI":"hi","HUNGARIAN":"hu",'
		.'"ICELANDIC":"is","INDONESIAN":"id","INUKTITUT":"iu","IRISH":"ga",'
		.'"ITALIAN":"it","JAPANESE":"ja","JAVANESE":"jw","KANNADA":"kn",'
		.'"KAZAKH":"kk","KHMER":"km","KOREAN":"ko","KURDISH":"ku","KYRGYZ":"ky",'
		.'"LAO":"lo","LATIN":"la","LATVIAN":"lv","LITHUANIAN":"lt",'
		.'"LUXEMBOURGISH":"lb","MACEDONIAN":"mk","MALAY":"ms","MALAYALAM":"ml",'
		.'"MALTESE":"mt","MAORI":"mi","MARATHI":"mr","MONGOLIAN":"mn","NEPALI":"ne",'
		.'"NORWEGIAN":"no","OCCITAN":"oc","ORIYA":"or","PASHTO":"ps","PERSIAN":"fa",'
		.'"POLISH":"pl","PORTUGUESE":"pt","PORTUGUESE_PORTUGAL":"pt-PT",'
		.'"PUNJABI":"pa","QUECHUA":"qu","ROMANIAN":"ro","RUSSIAN":"ru",'
		.'"SANSKRIT":"sa","SCOTS_GAELIC":"gd","SERBIAN":"sr","SINDHI":"sd",'
		.'"SINHALESE":"si","SLOVAK":"sk","SLOVENIAN":"sl","SPANISH":"es",'
		.'"SUNDANESE":"su","SWAHILI":"sw","SWEDISH":"sv","SYRIAC":"syr","TAJIK":"tg",'
		.'"TAMIL":"ta","TATAR":"tt","TELUGU":"te","THAI":"th","TIBETAN":"bo",'
		.'"TONGA":"to","TURKISH":"tr","UKRAINIAN":"uk","URDU":"ur","UZBEK":"uz",'
		.'"UIGHUR":"ug","VIETNAMESE":"vi","WELSH":"cy","YIDDISH":"yi",'
		.'"YORUBA":"yo"}'
	);
	$arr=array();
	foreach ($languages as $k=>$v) {
		$arr[$v]=$k;
	}
	return $arr;
}
