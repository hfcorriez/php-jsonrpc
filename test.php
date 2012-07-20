<?php

/**
 * test.php
 *
 * @author      hfcorriez <hfcorriez@gmail.com>
 * @version     $Id: test.php v 0.1 2010-11-10 16:54:05 hfcorriez $
 * @copyright   Copyright (c) 2007-2010 PPLive Inc.
 *
 */
require_once 'jsonrpc.php';

JsonRpc::instance()->start();
JsonRpc::instance()->add('math.*', 'MathRpc');
JsonRpc::instance()->run();

function test($a, $b) {
    return $a + $b;
}

class MathRpc {

    function add($a, $b) {
        return $a + $b;
    }

    function sub($a, $b) {
        return $a - $b;
    }

    function div($a, $b) {
        return $a / $b;
    }

    function mul($a, $b) {
        return $a * $b;
    }

}

?>