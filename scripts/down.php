<?php

include_once"mysql_data.php";	

if($_POST["action"] == "get_open_games") {	$maxPlayers = intval($_POST["maxPlayers"]);
	     
	$query = mysql_query("
		SELECT gameId, playerName, playersCount FROM (
			SELECT gameId, playerName, playerId, COUNT(*) as playersCount 
			FROM `players` AS p1 
			WHERE 
				p1.gameId in (SELECT gameId FROM `games` WHERE `status` = 'WAITING_FOR_PLAYERS')
			AND
				$maxPlayers > (SELECT COUNT(*) FROM `players` AS p2 WHERE p1.gameId = p2.gameId)		 
			GROUP BY `gameId` 
		) as T WHERE playerId = 0
		", $mysql);	
	$games = array();
	while($data = mysql_fetch_array($query)) {
		array_push($games, array("playerName" => $data["playerName"], "gameId" => $data["gameId"], "playersCount" => $data["playersCount"]) );	
	}
	$gamesJson = json_encode($games);
	echo $gamesJson;	
}








if($_POST["action"] == "get_players_moves_status") {	$gameId = intval($_POST["gameId"]);
	$playerId = intval($_POST["playerId"]);	
    $lastViewedMoveId = intval($_POST["lastViewedMoveId"]);
    
    $data = mysql_fetch_array(mysql_query("SELECT `status`, `playerIdToMove`, `movesMade` FROM `games` WHERE `gameId` = '$gameId' LIMIT 1")) or die(mysql_error());
 	$gameStatus = $data["status"];
 	$playerIdToMove = intval($data["playerIdToMove"]);
 	$movesMade = intval($data["movesMade"]);
 	mysql_query("UPDATE `games` SET `lastActivity` = NOW() WHERE `gameId` = $gameId LIMIT 1") or die(mysql_error());
    
	
	
	$query = mysql_query("
		SELECT * 
		FROM `moves` 
		WHERE 
			`gameId` = '$gameId' 
			AND `moveId` > '$lastViewedMoveId' 
			AND `playerId` <> '$playerId'
		ORDER BY `moveId` ASC") or die(mysql_error());
	$moves = array();
	while($data = mysql_fetch_array($query)) {
		array_push($moves, array("moveId" => intval($data["moveId"]), "playerId" => intval($data["playerId"]), "type" => $data["moveType"], "data" => json_decode($data["data"]), "fieldCoords" => json_decode($data["fieldCoords"])));	
	}  
  
    
    $query = mysql_query("
		SELECT playerId, playerName, playerColor  
		FROM `players` 
		WHERE 
			`gameId` = $gameId
		ORDER BY `playerId` ASC", $mysql) or die(mysql_error());
	$players = array();
	while($data = mysql_fetch_array($query)) {		array_push($players, array("name" => $data["playerName"], "id" => $data["playerId"], "color" => $data["playerColor"]));	
	}  
	mysql_query("UPDATE `players` SET `lastActivity` = NOW() WHERE `gameId` = $gameId AND `playerId` = $playerId") or die(mysql_error());
	
	
	
	 
	
	$data = array("gameStatus" => $gameStatus, "playerIdToMove" => $playerIdToMove, "movesMade" => $movesMade, "players" => $players, "moves" => $moves);
	$dataJson = json_encode($data); 
	echo $dataJson;      
}



?>