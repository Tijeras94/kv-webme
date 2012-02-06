<?php
/**
	* smarty functions
	*
	* PHP version 5.2
	*
	* @category None
	* @package  None
	* @author   Kae Verens <kae@kvsites.ie>
	* @license  GPL 2.0
	* @link     http://kvsites.ie/
	*/

/**
	* get amount of product in stock (simple)
	*
	* @return int number in stock
	*/
function Products_amountInStock2($params, $smarty) {
	$pid=$smarty->_tpl_vars['product']->id;
	$product=Product::getInstance($pid);
	return (int)$product->vals['stockcontrol_total'];
}

/**
	* return data about the product owner
	*
	* @param array  $params parameters
	* @param object $smarty Smarty object
	*
	* @return string owner variables
	*/
function Products_owner2($params, $smarty) {
	$pid=$smarty->_tpl_vars['product']->id;
	$product=Product::getInstance($pid);
	$uid=(int)$product->vals['user_id'];
	if (!$uid) {
		return 'unknown';
	}
	$user=User::getInstance($uid);
	if (!$user) {
		return 'unknown';
	}
	return $user->name;
}

/**
	* return the base price for the product
	*
	* @param array  $params parameters
	* @param object $smarty Smarty object
	*
	* @return string the price
	*/
function Products_priceBase2($params, $smarty) {
	$pid=$smarty->_tpl_vars['product']->id;
	$product=Product::getInstance($pid);
	if (!isset($product->vals['online-store'])) {
		return '0';
	}
	$p=$product->vals['online-store'];
	$vat=isset($params['vat']) && $params['vat']
		?(100+$_SESSION['onlinestore_vat_percent'])/100
		:1;
	return OnlineStore_numToPrice($p['_price']*$vat, true, (int)@$params['round']);
}

/**
	* show the difference between base and sale price
	*
	* @param array  $params parameters
	* @param object $smarty Smarty object
	*
	* @return string HTML
	*/
function Products_priceDiscount2($params, $smarty) {
	$pid=$smarty->_tpl_vars['product']->id;
	$product=Product::getInstance($pid);
	if (!isset($product->vals['online-store'])) {
		return '0';
	}
	$p=$product->vals['online-store'];
	$discount=$p['_price']-$product->getPrice('sale');
	$vat=isset($params['vat']) && $params['vat']
		?(100+$_SESSION['onlinestore_vat_percent'])/100
		:1;
	return OnlineStore_numToPrice($discount*$vat, true, (int)@$params['round']);
}

/**
	* show the percentage of the discount
	*
	* @param array  $params parameters
	* @param object $smarty Smarty object
	*
	* @return string HTML
	*/
function Products_priceDiscountPercent2($params, $smarty) {
	$pid=$smarty->_tpl_vars['product']->id;
	$product=Product::getInstance($pid);
	if (!isset($product->vals['online-store'])) {
		return '0';
	}
	if ($product->getPrice()) {
		return (int)(100* (($product->getPrice()-$product->getPrice('sale'))/$product->getPrice()));
	}
	return '--';
}

/**
	* return the sale price for the product
	*
	* @param array  $params parameters
	* @param object $smarty Smarty object
	*
	* @return string HTML
	*/
function Products_priceSale2($params, $smarty) {
	$pid=$smarty->_tpl_vars['product']->id;
	$product=Product::getInstance($pid);
	if (!isset($product->vals['online-store'])) {
		return '0';
	}
	$vat=isset($params['vat']) && $params['vat']
		?(100+$_SESSION['onlinestore_vat_percent'])/100
		:1;
	return OnlineStore_numToPrice($product->getPrice('sale')*$vat, true, (int)@$params['round']);
}

/**
	* show how many have been sold
	*
	* @param array  $params parameters
	* @param object $smarty Smarty object
	*
	* @return string HTML
	*/
function Products_soldAmount2($params, $smarty) {
	$params=array_merge(
		array(
			'none'=>'0',
			'one'=>'1',
			'many'=>'%d'
		),
		$params
	);
	$pid=$smarty->_tpl_vars['product']->id;
	$product=Product::getInstance($pid);
	if (!isset($product->vals['online-store'])) {
		return '';
	}
	$sold=(int)$product->vals['online-store']['_sold_amt'];
	if ($sold==0) {
		return __($params['none']);
	}
	if ($sold==1) {
		return __($params['one']);
	}
	return str_replace('%d', $sold, $params['many']);
}

/**
	* return a QR code for the product
	*
	* @param array  $params parameters
	* @param object $smarty Smarty object
	*
	* @return string image
	*/
function Products_qrCode2($params, $smarty) {
	if (@$smarty->_tpl_vars['isvoucher']!=1) {
		return '<img src="/a/p=products/f=showQrCode/pid='
			.$smarty->_tpl_vars['product']->id.'"/>';
	}
	return 'test';
}
