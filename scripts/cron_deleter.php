<?php

include_once"mysql_data.php";

$query = mysql_query("
	DELETE FROM `players` 
	WHERE `lastActivity` < NOW() - INTERVAL 2 MINUTE
");

$query = mysql_query("
	DELETE FROM `games` 
	WHERE 
		`status` = 'WAITING_FOR_PLAYERS'
		AND
		`lastActivity` < NOW() - INTERVAL 1 MINUTE
");


?>