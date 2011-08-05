<?php

/**
	* API for common non-admin WebME functions
	*
	* PHP version 5.2
	*
	* @category None
	* @package  None
	* @author   Kae Verens <kae@kvsites.ie>
	* @license  GPL 2.0
	* @link     http://kvsites.ie/
	*/

function getFileInfo() {
	if (!isset($_REQUEST['src'])) {
		return array('error'=>'missing src');
	}
	$file=USERBASE.$_REQUEST['src'];
	if (strpos($file, '..')!==false
		|| (strpos($file, '/.')!==false
		&& strpos(preg_replace('#/\.files/#', '/', $file), '/.')!==false)
	) {
		exit;
	}
	if (!file_exists($file) || !is_file($file)) {
		header('HTTP/1.0 404 Not Found');
		echo 'file does not exist';
		exit;
	}
	
	$finfo=finfo_open(FILEINFO_MIME_TYPE);
	$mime=finfo_file($finfo, $file);
	
	return array(
		'mime'=>$mime
	);
}
function getUserData() {
	if (!isset($_SESSION['userdata'])) { // not logged in
		return array('error'=>'you are not logged in');
	}
	$user=dbRow(
		'select id,name,email,phone,address,parent,extras,last_login,last_view,da'
		.'te_created from user_accounts where id='.$_SESSION['userdata']['id']
		.' limit 1'
	);
	$user['address']=json_decode($user['address'], true);
	$user['extras']=json_decode($user['extras'], true);
	$groups=dbAll(
		'select groups_id from users_groups where user_accounts_id='
		.$_SESSION['userdata']['id']
	);
	$g=array();
	foreach ($groups as $group) {
		array_push($g, $group['groups_id']);
	}
	$user['groups']=$g;
	return $user;
}