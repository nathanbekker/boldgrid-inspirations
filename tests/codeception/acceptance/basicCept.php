<?php

/**
 * Basic test to demonstrate that it works.
 *
 * @package wp-browser-travis-demo
 * @since 1.0.0
 */

$I = new AcceptanceTester( $scenario );
$I->wantTo( 'Visit WordPress Dashboard' );

codecept_debug( $I->executeJS( 'return document.body.innerHTML;') );

//$I->loginAsAdmin();
//$I->see( 'Dashboard' );

// EOF
