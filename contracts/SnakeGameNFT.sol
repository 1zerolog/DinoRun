// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SnakeGameNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    struct GameScore {
        address player;
        uint256 score;
        uint256 timestamp;
    }
    
    mapping(uint256 => GameScore) public tokenScores;
    
    event ScoreMinted(address indexed player, uint256 indexed tokenId, uint256 score);
    
    constructor() ERC721("Snake Game Score", "SNAKE") Ownable(0xe1bf2Dd72A8A026bEb20d8bF75276DF260507eFc) {
        _tokenIdCounter = 0;
    }
    
    function mintScore(uint256 score) public returns (uint256) {
        require(score >= 30, "Score must be at least 30 to mint");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        
        tokenScores[tokenId] = GameScore({
            player: msg.sender,
            score: score,
            timestamp: block.timestamp
        });
        
        emit ScoreMinted(msg.sender, tokenId, score);
        
        return tokenId;
    }
    
    function getTokenScore(uint256 tokenId) public view returns (GameScore memory) {
        require(tokenId < _tokenIdCounter, "Token does not exist");
        return tokenScores[tokenId];
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < _tokenIdCounter, "Token does not exist");
        
        GameScore memory gameScore = tokenScores[tokenId];
        
        // Simple on-chain metadata
        string memory json = string(abi.encodePacked(
            '{"name": "Snake Game Score #',
            _toString(tokenId),
            '", "description": "A memorable Snake Game score of ',
            _toString(gameScore.score),
            ' points", "attributes": [{"trait_type": "Score", "value": ',
            _toString(gameScore.score),
            '}, {"trait_type": "Timestamp", "value": ',
            _toString(gameScore.timestamp),
            '}]}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", _base64Encode(bytes(json))));
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";
        
        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        
        uint256 i = 0;
        uint256 j = 0;
        
        while (i < len) {
            uint256 a = uint256(uint8(data[i++]));
            uint256 b = i < len ? uint256(uint8(data[i++])) : 0;
            uint256 c = i < len ? uint256(uint8(data[i++])) : 0;
            
            uint256 triple = (a << 16) + (b << 8) + c;
            
            result[j++] = bytes(table)[((triple >> 18) & 63)];
            result[j++] = bytes(table)[((triple >> 12) & 63)];
            result[j++] = i > len + 1 ? bytes("=")[0] : bytes(table)[((triple >> 6) & 63)];
            result[j++] = i > len ? bytes("=")[0] : bytes(table)[(triple & 63)];
        }
        
        return string(result);
    }
}
