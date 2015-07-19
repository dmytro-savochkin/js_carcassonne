<?php

include_once"mysql_data.php";


if($_POST["action"] == "create_game") {
	$playerId = 0;
    $tilesQueue = $_POST["tilesQueue"];
	$playerName = mysql_real_escape_string($_POST["playerName"]);
	$playerColor = mysql_real_escape_string($_POST["playerColor"]);
	mysql_query("BEGIN");
	mysql_query("INSERT INTO `games` SET 
		`status` = 'WAITING_FOR_PLAYERS', 
		`playerIdToMove` = '$playerId', 
		`tilesQueue` = '$tilesQueue',
		`lastActivity` = NOW()
	", $mysql) or die(mysql_error());
	$gameId = mysql_insert_id($mysql);
	mysql_query("COMMIT");
	
	mysql_query("INSERT INTO `players` SET 
		`gameId` = '$gameId', 
		`playerId` = '$playerId',
		`playerName` = '$playerName',
		`playerColor` = '$playerColor',
		`lastActivity` = NOW()
	", $mysql) or die(mysql_error()); 
	
	echo $gameId;
}








if($_POST["action"] == "join_game") {
	$gameId = intval($_POST["gameId"]);
	$playerName = mysql_real_escape_string($_POST["playerName"]);
	$allColors = $_POST["allColors"];  
	$maxPlayers = intval($_POST["maxPlayers"]);
	
	$usedColors = array();
	$query = mysql_query("SELECT COUNT(playerId) playersCount,  playerColor
		FROM players
		WHERE gameId = '$gameId'
		GROUP BY playerId");
	while($data = mysql_fetch_array($query)) {
		$playersCount = $data["playersCount"];
		array_push($usedColors, $data["playerColor"]);		
	}
	
	$availableColors = array_diff($allColors, $usedColors);
	shuffle($availableColors);
	$playerColor = array_shift($availableColors);
		
	if($playersCount < $maxPlayers) {
		mysql_query("BEGIN");
		$maxPlayerId = mysql_result(mysql_query("SELECT MAX(playerId) FROM players WHERE gameId = '$gameId'"), 0) + 1;
		mysql_query("INSERT INTO `players` SET 
			`gameId` = '$gameId', 
			`playerId` = $maxPlayerId,
			`playerName` = '$playerName',
			`playerColor` = '$playerColor',
			`lastActivity` = NOW()
		", $mysql) or die(mysql_error()); 
		mysql_query("COMMIT");
		
		$players = array();     
		$query = mysql_query("SELECT * FROM `players` WHERE `gameId` = '$gameId' ORDER BY `playerId` ASC", $mysql) or die(mysql_error());
		while($data = mysql_fetch_array($query)) {
			array_push($players, array("name" => $data["playerName"], "color" => $data["playerColor"], "id" => $data["playerId"]));	
		}
	
		$tilesQueueJson = mysql_result(mysql_query("SELECT `tilesQueue` FROM `games` WHERE `gameId` = '$gameId'", $mysql),0) or die(mysql_error());
		$tilesQueue = json_decode($tilesQueueJson);
	
		$data = array("players" => $players, "tilesQueue" => $tilesQueue, "yourId" => $maxPlayerId);
		$dataJson = json_encode($data);
	
		echo $dataJson;
	} else {
		echo"maxPlayers";		
	}
		
}






if($_POST["action"] == "tile_placed") {
	$myMoveId = intval($_POST["myMoveId"]);
	$gameId = intval($_POST["gameId"]);
	$playerId = intval($_POST["playerId"]);
	$orientation = mysql_real_escape_string($_POST["orientation"]);
	if($_POST["fieldCoordsX"] === "null" || $_POST["fieldCoordsY"] === "null") {
		$fieldCoords = NULL;
	} else {	
		$fieldCoords = array("x" => intval($_POST["fieldCoordsX"]), "y" => intval($_POST["fieldCoordsY"]));  
	}
	
	$data = array("orientation" => $orientation);
	$dataJson = json_encode($data);
	$fieldCoordsJson = json_encode($fieldCoords); 
	
	
	
	$tilesCountAtPlacingField = mysql_num_rows(mysql_query("
		SELECT `fieldCoords` FROM `moves` WHERE 
			`moveType` = 'TILE' AND  
			`gameId` = '$gameId' AND
			`fieldCoords` = '$fieldCoordsJson' 
		") );
	   
	 
	 
	if($tilesCountAtPlacingField == 0 || $fieldCoords == NULL) {	
		mysql_query("INSERT INTO `moves` SET 
			`gameId` = '$gameId', 
			`playerId` = $playerId,
			`moveType` = 'TILE',
			`data` = '$dataJson',
			`fieldCoords` = '$fieldCoordsJson'
		", $mysql) or die(mysql_error());      
		$moveId = mysql_insert_id($mysql);
	
		if($fieldCoords != NULL) 
			mysql_query("UPDATE `games` SET `movesMade` = (movesMade + 1), `status` = 'WAITING_FOR_MEEPLE' WHERE `gameId` = '$gameId' AND `status` <> 'GAME_END' LIMIT 1") or die(mysql_error());
	    else
	    	mysql_query("UPDATE `games` SET `movesMade` = (movesMade + 1) WHERE `gameId` = '$gameId' AND `status` <> 'GAME_END' LIMIT 1") or die(mysql_error());
	     
	  
		echo json_encode(array("type" => "tiles", "myMoveId" => $myMoveId, "result" => "ok", "moveId" => $moveId));	
	} 
	else {
		echo json_encode(array("type" => "tiles", "myMoveId" => $myMoveId, "result" => "placed_already"));	
	}	
}






if($_POST["action"] == "meeple_placed") {
	$myMoveId = intval($_POST["myMoveId"]);
	$nextPlayerId = intval($_POST["nextPlayerId"]);
	$gameId = intval($_POST["gameId"]);
	$playerId = intval($_POST["playerId"]);
	$orientation = mysql_real_escape_string($_POST["orientation"]);
	
	if($_POST["cellCoordsX"] === "null" || $_POST["cellCoordsY"] === "null") {
		$cellCoords = NULL;	
	} else {
		$cellCoords = array("x" => intval($_POST["cellCoordsX"]), "y" => intval($_POST["cellCoordsY"]));  
	}
	$fieldCoords = array("x" => intval($_POST["fieldCoordsX"]), "y" => intval($_POST["fieldCoordsY"]));
	
	$meepleData = array("cellCoords" => $cellCoords,  "orientation" => $orientation);
	$meepleDataJson = json_encode($meepleData);
	$fieldCoordsJson = json_encode($fieldCoords);
	
	
	
	
	$meeplesCountAtPlacingField = mysql_num_rows(mysql_query("
		SELECT `fieldCoords` FROM `moves` WHERE 
			`moveType` = 'MEEPLE' AND  
			`gameId` = '$gameId' AND
			`fieldCoords` = '$fieldCoordsJson' 
		") );
	$tilesCountAtPlacingField = mysql_num_rows(mysql_query("
		SELECT `fieldCoords` FROM `moves` WHERE 
			`moveType` = 'TILE' AND  
			`gameId` = '$gameId' AND
			`fieldCoords` = '$fieldCoordsJson' 
		") );	
	
	
	if($meeplesCountAtPlacingField == 0) {
		if($tilesCountAtPlacingField > 0) {
			mysql_query("INSERT INTO `moves` SET 
				`gameId` = '$gameId', 
				`playerId` = $playerId,
				`moveType` = 'MEEPLE',
				`data` = '$meepleDataJson',
				`fieldCoords` = '$fieldCoordsJson'
			", $mysql) or die(mysql_error());      
			$moveId = mysql_insert_id($mysql);
	 
			//if(mysql_result(mysql_query("SELECT `status` FROM `games` WHERE `gameId` = '$gameId' LIMIT 1") ,0) != "GAME_END")
			mysql_query("
				UPDATE `games` 
				SET 
					`status` = 'WAITING_FOR_TURN', 
					`playerIdToMove` = '$nextPlayerId' 
				WHERE
					`status` <> 'GAME_END' AND 
					`gameId` = '$gameId' 
				LIMIT 1") or die(mysql_error());
			//else 
			mysql_query("UPDATE `games` SET `movesMade` = (movesMade + 1) WHERE `gameId` = '$gameId' LIMIT 1") or die(mysql_error());
	
			echo json_encode(array("type" => "meeples", "myMoveId" => $myMoveId, "result" => "ok", "moveId" => $moveId));	
		}
		else {
			echo json_encode(array("type" => "meeples", "myMoveId" => $myMoveId, "result" => "fail"));	
		}
	}
	else {
		echo json_encode(array("type" => "meeples", "myMoveId" => $myMoveId, "result" => "placed_already"));
	}	
	
}








if($_POST["action"] == "next_player") {
	$gameId = intval($_POST["gameId"]);
	$playerIdToMove = intval($_POST["playerIdToMove"]);
	mysql_query("UPDATE `games` SET `playerIdToMove` = '$playerIdToMove', `status` = 'WAITING_FOR_TURN' WHERE `gameId` = '$gameId' AND `status` <> 'GAME_END'");	
	echo $playerIdToMove;
}

if($_POST["action"] == "end_game") {
	$gameId = intval($_POST["gameId"]);
	mysql_query("UPDATE `games` SET `status` = 'GAME_END' WHERE `gameId` = '$gameId'");	
}

if($_POST["action"] == "start_game") {
	$gameId = intval($_POST["gameId"]);
	mysql_query("UPDATE `games` SET `status` = 'WAITING_FOR_TURN' WHERE `gameId` = '$gameId'");	
}





if($_POST["action"] == "delete_game") {
	$gameId = intval($_POST["gameId"]);
	mysql_query("DELETE FROM `games` WHERE `gameId` = '$gameId' ", $mysql) or die(mysql_error());
}

if($_POST["action"] == "delete_player") {
	$playerId = intval($_POST["playerId"]);
	$gameId = intval($_POST["gameId"]);
	mysql_query("DELETE FROM `players` WHERE `playerId` = '$playerId' AND `gameId` = '$gameId' ", $mysql) or die(mysql_error());
}


?>