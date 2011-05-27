<?php

/**
 * api/recent.php, KV-Webme Themes API
 *
 * returns a number of recent themes, where
 * count is the number of themes to return,
 * 10 is the default value
 * * paramaters that can be given:
 *
 * recent       -       should be boolean true
 * count	-	number of themes to return, default = 10
 * start	-	offset to start query from, default = 0
 *
 * @author     Conor Mac Aoidh <conormacaoidh@gmail.com>
 * @license    GPL 2.0
 * @version    1.0
 */

/**
 * make sure api rules are being followed
 */
$recent = @$_GET[ 'recent' ];
if( $recent != 'true' )
	exit;

/**
 * check if count is defined
 */
$count = ( int ) @$_GET[ 'count' ];
if( $count == 0 )
	$count = 10;

/**
 * check if start is defined
 */
$start = ( int ) @$_GET[ 'start' ];

/**
 * get themes from db
 */
$themes = dbAll( 'select id, name, author, description, version, last_updated, author_url, tags, rating from themes_api where moderated="yes" order by last_updated desc limit ' . $start . ', ' . $count );

/**
 * die if error or empty
 */
if( $themes == false || count( $themes ) == 0 )
	die( 'none' );

/**
 * add screenshots, html files and
 * download link to array
 */
for( $i = 0; $i < count( $themes ); ++$i ){

	$author = dbOne( 'select name from user_accounts where id=' . $themes[ $i ][ 'author' ], 'name' );
	$id = $themes[ $i ][ 'id' ];
	$themes[ $i ][ 'author' ] = $author;
	$themes[ $i ][ 'short_description' ] = substr( $themes[ $i ][ 'description' ], 0, 26 ) . ' ...';
	$themes[ $i ][ 'screenshot' ] = themes_api_get_screenshot( $id );
        $themes[ $i ][ 'variants' ] = themes_api_get_variants( $id );
	$themes[ $i ][ 'download' ] = themes_api_download_link( $id );

}

/**
 * json_encode and print results
 */
$themes = json_encode( $themes );
die( $themes );