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
            String tableId = map.get("tableId").toString();

            kjoApiMapper.deleteFieldTable(map);

            kjoApiMapper.deleteHeaderTable(map);

            if(!tableId.isEmpty()){
                query = "drop table if exists " + tableId;
                kjoApiMapper.definitionMainTable(query);
            }
        }

        return ResponseEntity.ok().build();
    }

    @Override
    public Map<String, Object> selectTableName(Map<String, Object> data) {
        Map<String, Object> listMap = kjoApiMapper.selectTableName(data);

        int table = kjoApiMapper.findTable(listMap);

        if(table > 0) {
            int dataCount = kjoApiMapper.selectDataCount(listMap);
            listMap.put("dataCount", dataCount);
        }

        return listMap;
    }

    @Override
    public List<Map<String, Object>> selectFieldTable(Map<String, Object> data) {
        return kjoApiMapper.selectFieldTable(data);
    }

    @Override
    @Transactional
    public ResponseEntity<?> saveFieldTable(Map<String, Object> data) {

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

            String supi = Objects.toString(map.get("supiHeader"), null);
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
            if(map == null) continue;
            map.put("children", new ArrayList<Map<String, Object>>());
            idMap.put((String) map.get("headerId"), map);
        }

        for (Map<String, Object> node : data) {
            if(node == null) continue;
            node.put("selected", false);
            String supi = Objects.toString(node.get("supiHeader"), null);
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

    @Override
    @Transactional
    public ResponseEntity<?> createTable(Map<String, Object> data) {
        List<Map<String, Object>> maps = kjoApiMapper.selectFieldTable(data);
        List<Map<String, Object>> codeList = kjoApiMapper.selectColTypeCode();
        String maxTableId = kjoApiMapper.selectMaxTableId();

        if(maxTableId.isEmpty()) {
            maxTableId = "uda_db_001";
        } else {
            String idSeq = maxTableId.split("_")[2];
            int seq = Integer.parseInt(idSeq) + 1;
            String formatSeq = String.format("%03d", seq);
            maxTableId = "uda_db_" + formatSeq;
        }

        Map<String, String> code =  new HashMap<>();

        for(Map<String, Object> map : codeList){
            code.put((String) map.get("code"), (String) map.get("value"));
        }

        data.put("tableId", maxTableId);

        kjoApiMapper.updateMainTable(data);

        String query;

        if(!maps.isEmpty()) {
            query = "create table " + maxTableId + " (\n";

            query += makeQueryTmp(maps, code);
            query += "\n)";
            kjoApiMapper.definitionMainTable(query);
        }

        return ResponseEntity.ok().build();
    }

    private String makeQueryTmp(List<Map<String, Object>> listMap, Map<String, String> code) {
        List<String> primaryKeys = new ArrayList<>();
        StringBuilder sb = new StringBuilder();

        for(int i = 0; i < listMap.size(); i++) {
            Map<String, Object> map = listMap.get(i);

            String colNm = map.get("colName").toString();
            String colType = map.get("colType").toString();
            String colSize = map.get("colSize").toString();
            boolean colIdx = (map.get("colIdx") instanceof Long) && ((Long)map.get("colIdx")) == 1L; ;

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

    @Override
    public ResponseEntity<?> initTable(Map<String, Object> data) {
        String query = "drop table " + data.get("tableId").toString() + "\n";
        kjoApiMapper.definitionMainTable(query);
        return ResponseEntity.ok().build();
    }
}
