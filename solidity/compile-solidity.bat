echo off

:: Current working directory
FOR /f %%i in ('CD') DO SET current-wokring-directory=%%i

SET contract-directory=contract

:: Common root for the solidity contracts and domain structs
SET base_path=%current-wokring-directory%\%contract-directory%

:: Absolute path for each common contracts
set challenger=%base_path%\challenger

echo   Root: %base_path%

CD ./%contract-directory%

::echo on

:: Compiling the contracts
CALL :CompileContract ./domain-name-system  	DomainNameSystem.sol 			%base_path% 

CALL :CompileContract access-control  			AccessControl.sol				%base_path%    
CALL :CompileContract access-control  			HierarchicalAccessControl.sol	%base_path%    
CALL :CompileContract access-control  			AccessControlled.sol 			%base_path%
    
CALL :CompileContract linked-list          		DoubleLinkedList.sol          	%base_path%

CALL :CompileContract action/mvp  				MvpActions.sol 					%base_path%    
CALL :CompileContract agent/mvp  				MvpAgents.sol 					%base_path%    
CALL :CompileContract device/mvp  				MvpDevices.sol 					%base_path%    
CALL :CompileContract challenge          		ChallengerEmitter.sol          	%base_path%
CALL :CompileContract challenge/mvp          	MvpChallenges.sol          		%base_path%
CALL :CompileContract organization/mvp          MvpOrganization.sol          	%base_path%
CALL :CompileContract organization/mvp          MvpOrganizations.sol          	%base_path%
CALL :CompileContract policy/mvp          		MvpPolicy.sol          			%base_path%
CALL :CompileContract policy/mvp          		MvpPolicies.sol          		%base_path%


::CALL :CompileContract event-emitter       	EventEmitter.sol

echo off

CD ../

EXIT /B 0

::Compile function
:CompileContract
solc ./%~1/%~2 --allow-paths %~3 --bin --abi --optimize  --overwrite -o %~1

::docker run -v %base_path%:/sources ethereum/solc:stable /sources/%~1/%~2 --allow-paths /sources --bin --abi --optimize  --overwrite -o %~1
