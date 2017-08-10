<?php

/**
 * Basic test to demonstrate that it works.
 *
 * @package wp-browser-travis-demo
 * @since 1.0.0
 */

$I = new AcceptanceTester( $scenario );

$I->wantTo( 'Login to the WordPress Dashboard' );
$I->amOnPage( '/wp-login.php' );
$I->fillField( '#user_login', 'admin' );
$I->fillField( '#user_pass', 'password' );
$I->click( 'Log In' );
$I->see( 'Dashboard' );
$I->see( 'Howdy,' );
$I->see( 'Enter Your BoldGrid Connect Key' );