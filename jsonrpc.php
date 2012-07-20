<?php

/**
 * jsonrpc.php
 *
 * @author      hfcorriez <hfcorriez@gmail.com>
 * @version     $Id: jsonrpc.php v 0.1 2010-11-10 15:54:28 hfcorriez $
 * @copyright   Copyright (c) 2007-2010 PPLive Inc.
 *
 */
class JsonRpc {

    protected $callback;
    protected $params;
    protected $namespace;
    protected $jsonrpc = '2.0';
    protected $functions = array();
    protected $jsonp = 'cb';

    /**
     * 初始化一些参数
     * 注意：回调参数固定为callback，传递方式为POST
     */
    function start() {
        $callback = strpos($GLOBALS['HTTP_RAW_POST_DATA'], "&{$this->jsonp}=");
        $post = $GLOBALS['HTTP_RAW_POST_DATA'];
        if ($callback !== false) {
            $post = substr($GLOBALS['HTTP_RAW_POST_DATA'], 0, $callback);
            $callback = substr($GLOBALS['HTTP_RAW_POST_DATA'], $callback + strlen($this->jsonp) + 2);
        }
        $data = (array) json_decode($post);
        $this->namespace = $data['method'];
        $this->callback = $callback;
        $this->jsonrpc = $data['jsonrpc'];
        $this->params = $data['params'];
        if (empty($data))
            exit('please use jsonrpc to request.');
    }

    /**
     * 添加方法
     * @param string $namespace     命名空间
     * @param mixed $cf             对象或函数名
     * @param string $func          函数名
     * @return boolean              是否成功
     *
     * @example
     * $jsonrpc->add('class.method');               #类静态方法
     * $jsonrpc->add('function');                   #函数
     * $jsonrpc->add('namespace', 'class', 'method')#静态方法+命名
     * $jsonrpc->add('namespace', $obj, 'method')   #对象方法+命名
     * $jsonrpc->add('namespace', 'function')       #函数并运+命名
     * $jsonrpc->add('namespace', 'class.method')   #静态方法+命名
     */
    function add($namespace, $cf = '', $func = '') {
        if (!$cf)
            $cf = $namespace;
        $this->functions[$namespace] = array($cf, $func);
        return $add;
    }

    /**
     * 选择空间并运行函数
     */
    function run() {
        $run = false;
        list($cf, $func) = $this->functions[$this->namespace];
        if (empty($this->functions[$this->namespace])) {
            if (!$ns = $this->functions[str_replace(strstr($this->namespace, '.'), '.*', $this->namespace)])
                $this->error('unkown namespace.');
            else {
                list($cf) = $ns;
                $func = substr($this->namespace, strpos($this->namespace, '.') + 1);
            }
        }
        if (is_string($cf) && $cf && !$func && strpos($cf, '.') !== false) {
            list($cf, $func) = explode('.', $cf);
            if (method_exists($cf, $func))
                $run = true;
        }
        if ($func && is_string($func) && method_exists($cf, $func)) {
            $run = true;
        }
        if ($run)
            $ret = call_user_func_array(array($cf, $func), $this->params);
        if (is_string($cf) && $cf && !$func && function_exists($cf)) {
            $ret = call_user_func_array($cf, $this->params);
        }
        $this->result($ret);
    }

    /**
     * 获取变量
     * @param string $var           变量名
     * @return mixed                变量
     */
    function get($var) {
        if ($var)
            return $this->{$var};
        return false;
    }

    /**
     * 设置变量
     * @param string $var           变量名
     * @param mixed $value          变量
     */
    function set($var, $value) {
        $this->{$var} = $value;
    }

    /**
     * 输出错误信息
     * @param string $error         错误信息
     */
    function error($error = null) {
        $result = array('error' => $error, 'jsonrpc' => $this->jsonrpc, 'result' => array());
        $this->output($result);
    }

    /**
     * 输出结果
     * @param mixed $ret            结果数据
     */
    function result($ret = array()) {
        $result = array('error' => null, 'jsonrpc' => $this->jsonrpc, 'result' => $ret);
        $this->output($result);
    }

    /**
     * 输出数据
     * @param mixed $result         数据
     */
    function output($result) {
        ob_clean();
        if ($this->callback)
            echo $this->callback . '(' . json_encode($result) . ');';
        else
            echo json_encode($result);
        exit;
    }

    /**
     * 静态化实例
     * 方便其他函数内部调用
     * @staticvar object $instance  静态实例
     * @return object               对象
     */
    static function instance() {
        static $instance = null;
        if ($instance === null) {
            $instance = new self();
        }
        return $instance;
    }

}

?>