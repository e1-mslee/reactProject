package com.e1.backend.serviceimpl;

import com.e1.backend.mapper.KjoApiMapper;
import com.e1.backend.service.KjoApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class KjoApiServiceImpl implements KjoApiService {
    private final KjoApiMapper kjoApiMapper;

    @Override
    public List<Map<String, Object>> selectMainTable(Map<String, Object> data) {
        List<Map<String, Object>> listMap = kjoApiMapper.selectMainTable(data);

        for(Map<String, Object> map : listMap){
            int table = kjoApiMapper.findTable(map);

            if(table > 0) {
                int dataCount = kjoApiMapper.selectDataCount(map);
                map.put("dataCount", dataCount);
            }
        }

        return listMap;
    }

    @Override
    @Transactional
    public ResponseEntity<?> insertMainTable(List<Map<String, Object>> data) {

        kjoApiMapper.insertMainTable(data);

        /*
        List<Map<String, Object>> insertData = data.stream().filter(map -> map.get("tableSeq") == null || map.get("tableSeq").equals("")).toList();
        List<Map<String, Object>> updateData = data.stream().filter(map -> map.get("tableSeq") != null && !map.get("tableSeq").equals("")).toList();

        if(!insertData.isEmpty())
            kjoApiMapper.insertMainTable(insertData);

        if(!updateData.isEmpty()) {
            for(Map<String, Object> map : updateData) {
                kjoApiMapper.updateMainTable(map);
            }
        }*/

        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<?> updateMainTable(Map<String, Object> data) {
        kjoApiMapper.updateMainTable(data);

        return ResponseEntity.ok().build();
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteMainTable(List<Map<String, Object>> data) {
        kjoApiMapper.deleteMainTable(data);

        String query = "";
        for(Map<String, Object> map : data) {
            kjoApiMapper.deleteFieldTable(map);

            kjoApiMapper.deleteHeaderTable(map);

            query = "drop table if exists " + map.get("tableId").toString();
            kjoApiMapper.definitionMainTable(query);
        }

        return ResponseEntity.ok().build();
    }

    @Override
    public Map<String, Object> selectTableName(Map<String, Object> data) {
        Map<String, Object> listMap = kjoApiMapper.selectTableName(data);
        int dataCount = kjoApiMapper.selectDataCount(listMap);
        listMap.put("dataCount", dataCount);

        return listMap;
    }

    @Override
    public List<Map<String, Object>> selectFieldTable(Map<String, Object> data) {
        return kjoApiMapper.selectFieldTable(data);
    }

    @Override
    @Transactional
    public ResponseEntity<?> saveFieldTable(Map<String, Object> data) {
        List<Map<String, Object>> codeList = kjoApiMapper.selectColTypeCode();

        Map<String, String> code =  new HashMap<>();

        for(Map<String, Object> map : codeList){
            code.put((String) map.get("code"), (String) map.get("value"));
        }

        List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");

        List<Map<String, Object>> added = (List<Map<String, Object>>) data.get("added");
        List<Map<String, Object>> edited = (List<Map<String, Object>>) data.get("edited");
        List<Map<String, Object>> removed = (List<Map<String, Object>>) data.get("removed");

        if(!added.isEmpty())
            kjoApiMapper.insertFieldTable(added);

        if(!edited.isEmpty()) {
            for (Map<String, Object> map : edited) {
                kjoApiMapper.updateFieldTable(map);
            }
        }

        if(!removed.isEmpty()) {
            for(Map<String, Object> map : removed) {
                kjoApiMapper.deleteFieldTable(map);
            }
        }

        String query = "drop table if exists " + data.get("tableId").toString();
        kjoApiMapper.definitionMainTable(query);

        if(!items.isEmpty()) {
            query = "create table " + data.get("tableId").toString() + " (\n";
            List<String> primaryKeys = new ArrayList<>();

            List<Map<String, Object>> queryMap = Stream.of(edited, added)
                    .flatMap(Collection::stream)
                    .collect(Collectors.toList());

            query += makeQueryTmp(queryMap, primaryKeys, code);
            query += "\n)";
        }

        kjoApiMapper.definitionMainTable(query);

        return ResponseEntity.ok().build();
    }

    @Override
    public List<Map<String, Object>> selectHeaderTable(Map<String, Object> data) {
        List<Map<String, Object>> listMap = kjoApiMapper.selectHeaderTable(data);

        List<Map<String, Object>> result = sortTreePostOrder(listMap);

        return result;
    }

    @Override
    public ResponseEntity<?> saveHeaderTable(Map<String, List<Map<String, Object>>> data) {
        List<Map<String, Object>> added = data.get("added");
        List<Map<String, Object>> edited = data.get("edited");
        List<Map<String, Object>> removed = data.get("removed");

        if(!added.isEmpty())
            kjoApiMapper.insertHeaderTable(added);

        if(!edited.isEmpty()) {
            for (Map<String, Object> map : edited) {
                kjoApiMapper.updateHeaderTable(map);
            }
        }

        if(!removed.isEmpty()) {
            for(Map<String, Object> map : removed) {
                kjoApiMapper.deleteHeaderTable(map);
            }
        }

        return ResponseEntity.ok().build();
    }

    @Override
    public List<Map<String, Object>> selectHeaderId(Map<String, Object> data) {
        return kjoApiMapper.selectHeaderId(data);
    }

    @Override
    public List<Map<String, Object>> selectGridHeaderTable(Map<String, Object> data) {
        List<Map<String, Object>> listMap = kjoApiMapper.selectGridHeaderTable(data);
        List<Map<String, Object>> result = new ArrayList<>(listMap);

        int maxDept = listMap.stream()
                            .mapToInt(x -> Integer.parseInt(x.get("dept").toString()))
                            .max().orElse(0);

        for(int idx = 0; idx < listMap.size(); idx++) {
            Map<String, Object> map = listMap.get(idx);

            if(!map.get("child").toString().equals("0")) continue;

            String supi = map.get("supiHeader").toString();
            int dept = Integer.parseInt(map.get("dept").toString());

            map.put("cellSize", 1);

            if(dept != maxDept) {
                for(int i = dept+1; i <= maxDept; i++) {
                    Map<String, Object> tmpMap = new HashMap<>(map);
                    tmpMap.put("dept", i);
                    result.add(tmpMap);
                }
            }

            supiData(result, supi, 1);
        }

        result.sort(Comparator.comparing(x -> x.get("sortSn").toString()));

        return result;
    }

    public static void supiData(List<Map<String, Object>> list, String supi, int cellSize ) {
        list.stream()
                .filter(map -> map.get("headerId").toString().equals(supi))
                .findAny()
                .ifPresent(map -> {
                    int tmp = Integer.parseInt(map.getOrDefault("cellSize", 0).toString());

                    map.put("cellSize", tmp + cellSize);

                    String newSupi = map.get("supiHeader").toString();

                    if(!newSupi.isEmpty()) {
                        supiData(list, newSupi, cellSize);
                    }
                });
    }

    public static List<Map<String, Object>> sortTreePostOrder(List<Map<String, Object>> data) {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<String, Map<String, Object>> idMap = new HashMap<>();

        for(Map<String, Object> map : data) {
            map.put("children", new ArrayList<Map<String, Object>>());
            idMap.put((String) map.get("headerId"), map);
        }

        for (Map<String, Object> node : data) {
            node.put("selected", false);
            String supi = node.get("supiHeader").toString();
            if(supi == null || supi.isEmpty()) {
                result.add(node);
                continue;
            }

            Map<String, Object> parent = idMap.get(supi);
            if(parent != null) {
                List<Map<String, Object>> children = (List<Map<String, Object>>) parent.get("children");
                children.add(node);
            }
        }

        return result;
    }

    private String makeQueryTmp(List<Map<String, Object>> listMap, List<String> primaryKeys, Map<String, String> code) {
        StringBuilder sb = new StringBuilder();

        Map<String, Object> map = listMap.get(0);

        String colNm = map.get("colName").toString();
        String colType = map.get("colType").toString();
        String colSize = map.get("colSize").toString();
        Boolean colIdx = (Boolean) map.get("colIdx");

        /*sb.append(colNm).append(" ").append(code.get(colType));

        if(code.get(colType).equalsIgnoreCase("VARCHAR")) {
            sb.append("(").append(colSize).append(")");
        }
        log.info("colIdx: {}", colIdx);
        if(colIdx) {
            primaryKeys.add(colNm);
        }*/

        for(int i = 0; i < listMap.size(); i++) {
            map = listMap.get(i);

            colNm = map.get("colName").toString();
            colType = map.get("colType").toString();
            colSize = map.get("colSize").toString();
            colIdx = (Boolean) map.get("colIdx");

            sb.append(colNm).append(" ").append(code.get(colType));

            if(code.get(colType).equalsIgnoreCase("varchar")) {
                sb.append("(").append(colSize).append(")");
            }
            sb.append(",\n");

            if(colIdx) {
                primaryKeys.add(colNm);
            }
        }

        sb.delete(sb.length() - 2, sb.length());

        if(!primaryKeys.isEmpty()) {
            sb.append(",\n").append("primary key (");

            for(String key : primaryKeys) {
                sb.append(key).append(",");
            }
            sb.delete(sb.length()-1, sb.length());

            sb.append(")");
        }

        return sb.toString();
    }
}
